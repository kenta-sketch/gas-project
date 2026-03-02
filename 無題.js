// ============================================================
// 在庫推移表 + 消化率推移表（別シート）
// ============================================================
var INVENTORY_FOLDER_ID = '1JeQIYxMHoAuBAONYu6PTftqT-NxX8Vn9';
var INVENTORY_SHEET_NAME = '在庫推移';
var DIGESTION_TREND_SHEET_NAME = '消化率推移';

// --- 共通ユーティリティ ---
function getLocalUtils() {
  var LOCAL_CATEGORY_MAP = {
    'tp':'トップス','pt':'パンツ','sk':'スカート','wp':'ワンピース',
    'ot':'アウター','sr':'サロペット','set':'セットアップ','in':'インナー',
    'oi':'オールインワン','dr':'ドレス','jk':'学生服','zk':'小物','fb':'福袋'
  };
  return {
    getCategoryName: function(code) {
      if (!code || typeof code !== 'string') return '定番商品';
      var c = code.toLowerCase().trim();
      var firstPart = c.split('-')[0];
      var rest = firstPart.substring(1);
      if (rest.startsWith('da')) rest = rest.substring(2);
      else if (rest.startsWith('be')) rest = rest.substring(2);
      else rest = rest.substring(1);
      var sorted = Object.keys(LOCAL_CATEGORY_MAP).sort(function(a, b) { return b.length - a.length; });
      for (var i = 0; i < sorted.length; i++) {
        if (rest.startsWith(sorted[i])) return LOCAL_CATEGORY_MAP[sorted[i]];
      }
      return '定番商品';
    },
    extractModelNumber: function(code) {
      if (!code) return '';
      var parts = String(code).toLowerCase().trim().split('-');
      if (parts.length >= 2) {
        if (/^\d{4}$/.test(parts[1])) return parts[0] + '-' + parts[1];
        if (parts.length >= 3 && /^\d{6}$/.test(parts[2])) return parts[0] + '-' + parts[1] + '-' + parts[2];
        if (parts.length >= 3) return parts[0] + '-' + parts[1] + '-' + parts[2];
      }
      return parts[0];
    },
    parseCSVLine: function(line) {
      var result = [];
      var current = '';
      var inQuotes = false;
      for (var i = 0; i < line.length; i++) {
        var ch = line.charAt(i);
        if (inQuotes) {
          if (ch === '"') {
            if (i + 1 < line.length && line.charAt(i + 1) === '"') {
              current += '"'; i++;
            } else { inQuotes = false; }
          } else { current += ch; }
        } else {
          if (ch === '"') { inQuotes = true; }
          else if (ch === ',') { result.push(current); current = ''; }
          else { current += ch; }
        }
      }
      result.push(current);
      return result;
    },
    extractMonth: function(name) {
      var match = name.match(/(\d{4})年(\d{1,2})月/);
      if (match) return match[1] + '-' + ('0' + match[2]).slice(-2);
      return '';
    }
  };
}

// --- 一時データ保存/復元ヘルパー ---
function saveTempData_(ss, monthLabels, monthDataMap) {
  var sheetName = '_inv_temp';
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);
  sheet.clearContents();
  var rows = [];
  for (var m = 0; m < monthLabels.length; m++) {
    var ml = monthLabels[m];
    var map = monthDataMap[ml] || {};
    var keys = Object.keys(map);
    for (var k = 0; k < keys.length; k++) {
      rows.push([ml, keys[k], map[keys[k]]]);
    }
  }
  if (rows.length > 0) {
    sheet.getRange(1, 1, rows.length, 3).setValues(rows);
  }
  sheet.hideSheet();
}

function loadTempData_(ss) {
  var sheetName = '_inv_temp';
  var sheet = ss.getSheetByName(sheetName);
  var monthLabels = [];
  var monthDataMap = {};
  if (!sheet || sheet.getLastRow() === 0) return { monthLabels: monthLabels, monthDataMap: monthDataMap };
  var data = sheet.getDataRange().getValues();
  var labelSet = {};
  for (var i = 0; i < data.length; i++) {
    var ml = String(data[i][0]);
    var mn = String(data[i][1]);
    var st = Number(data[i][2]);
    if (!labelSet[ml]) { labelSet[ml] = true; monthLabels.push(ml); }
    if (!monthDataMap[ml]) monthDataMap[ml] = {};
    monthDataMap[ml][mn] = st;
  }
  return { monthLabels: monthLabels, monthDataMap: monthDataMap };
}

function cleanupTemp_(ss) {
  var props = PropertiesService.getScriptProperties();
  props.deleteProperty('inv_processed');
  var sheet = ss.getSheetByName('_inv_temp');
  if (sheet) ss.deleteSheet(sheet);
  var triggers = ScriptApp.getProjectTriggers();
  for (var t = 0; t < triggers.length; t++) {
    if (triggers[t].getHandlerFunction() === 'generateInventoryTrend') {
      ScriptApp.deleteTrigger(triggers[t]);
    }
  }
}

// --- 商品マスタ読み込み ---
function loadMasterMap() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var masterSheet = ss.getSheetByName('商品マスタ（入荷）');
  var masterMap = {};
  if (masterSheet && masterSheet.getLastRow() >= 2) {
    var data = masterSheet.getDataRange().getDisplayValues();
    for (var i = 1; i < data.length; i++) {
      var mNo = String(data[i][0]).trim().toLowerCase();
      if (!mNo) continue;
      masterMap[mNo] = {
        category: data[i][2] || '',
        supplier: data[i][3] || '',
        collab: data[i][5] || '',
        launchMonth: data[i][6] || '',
        costPrice: data[i][7] || '',
        totalInput: data[i][8] || ''
      };
    }
  }
  return masterMap;
}

// ============================================================
// ① 在庫推移表（自動再開対応）
// ============================================================
function generateInventoryTrend() {
  var startTime = new Date().getTime();
  var MAX_RUNTIME = 4.5 * 60 * 1000; // 4.5分でセーブ
  var utils = getLocalUtils();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var props = PropertiesService.getScriptProperties();

  // --- ファイル一覧取得 ---
  var folder = DriveApp.getFolderById(INVENTORY_FOLDER_ID);
  var files = folder.getFiles();
  var allFiles = [];
  while (files.hasNext()) {
    var f = files.next();
    if (f.getName().indexOf('在庫データ') !== -1) allFiles.push(f);
  }
  allFiles.sort(function(a, b) { return a.getName().localeCompare(b.getName()); });
  Logger.log('在庫データファイル数: ' + allFiles.length);
  for (var fi = 0; fi < allFiles.length; fi++) Logger.log('  ' + fi + ': ' + allFiles[fi].getName());

  // --- 前回の進捗を復元 ---
  var processedCount = parseInt(props.getProperty('inv_processed') || '0', 10);
  var monthLabels, monthDataMap;
  if (processedCount > 0) {
    var temp = loadTempData_(ss);
    monthLabels = temp.monthLabels;
    monthDataMap = temp.monthDataMap;
    Logger.log('再開: ' + processedCount + '/' + allFiles.length + 'ファイルから');
  } else {
    monthLabels = [];
    monthDataMap = {};
  }

  // --- ファイル処理（途中から再開可能） ---
  for (var i = processedCount; i < allFiles.length; i++) {
    if (new Date().getTime() - startTime > MAX_RUNTIME) {
      saveTempData_(ss, monthLabels, monthDataMap);
      props.setProperty('inv_processed', String(i));
      ScriptApp.newTrigger('generateInventoryTrend').timeBased().after(5000).create();
      Logger.log('中断・自動再開予約: ' + i + '/' + allFiles.length + 'ファイル処理済');
      return;
    }

    var file = allFiles[i];
    var fileName = file.getName();
    var monthLabel = utils.extractMonth(fileName);
    if (!monthLabel) continue;
    monthLabels.push(monthLabel);

    var blob = file.getBlob();
    var text = '';
    try { text = blob.getDataAsString('Shift_JIS'); } catch (e) {}
    if (!text || text.indexOf('商品コード') === -1) {
      try { text = blob.getDataAsString('UTF-8'); } catch (e2) {}
    }
    if (!text || text.indexOf('商品コード') === -1) {
      try { text = blob.getDataAsString('CP932'); } catch (e3) {}
    }
    if (!text) continue;

    var lines = text.split(/\r?\n/);
    if (lines.length < 2) continue;
    var headers = utils.parseCSVLine(lines[0]);
    var colSku = -1, colModel = -1, colStock = -1;
    for (var h = 0; h < headers.length; h++) {
      var hName = headers[h].replace(/[\s"]/g, '');
      if (hName === '商品コード') colSku = h;
      if (hName === '代表商品コード') colModel = h;
      if (hName === '在庫数') colStock = h;
    }
    if (colStock === -1) continue;

    var monthMap = {};
    for (var r = 1; r < lines.length; r++) {
      if (!lines[r].trim()) continue;
      var cols = utils.parseCSVLine(lines[r]);
      var sku = (cols[colSku] || '').replace(/"/g, '').trim().toLowerCase();
      var modelNo = (colModel >= 0) ? (cols[colModel] || '').replace(/"/g, '').trim().toLowerCase() : '';
      var stock = parseInt(String(cols[colStock] || '0').replace(/[",]/g, ''), 10) || 0;
      if (!sku.startsWith('nl') && !modelNo.startsWith('nl')) continue;
      if (!modelNo) modelNo = utils.extractModelNumber(sku);
      if (!modelNo) continue;
      if (!monthMap[modelNo]) monthMap[modelNo] = 0;
      monthMap[modelNo] += stock;
    }
    monthDataMap[monthLabel] = monthMap;
  }

  // --- 全ファイル処理完了 ---
  cleanupTemp_(ss);
  monthLabels.sort();

  var allModels = {};
  for (var m = 0; m < monthLabels.length; m++) {
    var keys = Object.keys(monthDataMap[monthLabels[m]] || {});
    for (var k = 0; k < keys.length; k++) {
      if (keys[k].trim()) allModels[keys[k]] = true;
    }
  }

  var masterMap = loadMasterMap();
  var modelKeys = Object.keys(allModels).sort();

  var outHeaders = ['型番', 'カテゴリ', '仕入先', 'コラボ', '販売開始', '下代', '累計投入'];
  for (var m = 0; m < monthLabels.length; m++) outHeaders.push(monthLabels[m]);
  outHeaders.push('最新在庫');
  outHeaders.push('推定販売数');
  outHeaders.push('消化率');

  var rows = [];
  for (var k = 0; k < modelKeys.length; k++) {
    var modelNo = modelKeys[k];
    if (!modelNo || !modelNo.trim()) continue;

    var ma = masterMap[modelNo] || {};
    var totalInput = parseInt(String(ma.totalInput || '0').replace(/,/g, ''), 10) || 0;

    var hasAnyStock = false;
    var latestStock = 0;
    for (var m = 0; m < monthLabels.length; m++) {
      var s = monthDataMap[monthLabels[m]][modelNo] || 0;
      if (s > 0) hasAnyStock = true;
      latestStock = s;
    }
    if (!hasAnyStock && totalInput === 0) continue;

    var row = [
      modelNo,
      ma.category || utils.getCategoryName(modelNo),
      ma.supplier || '', ma.collab || '',
      ma.launchMonth || '', ma.costPrice || '', ma.totalInput || ''
    ];
    for (var m = 0; m < monthLabels.length; m++) {
      row.push(monthDataMap[monthLabels[m]][modelNo] || 0);
    }
    row.push(latestStock);
    var estimatedSales = totalInput > 0 ? totalInput - latestStock : '';
    if (estimatedSales !== '' && estimatedSales < 0) estimatedSales = 0;
    row.push(estimatedSales);
    var digestion = '';
    if (totalInput > 0 && estimatedSales !== '') digestion = estimatedSales / totalInput;
    row.push(digestion);
    rows.push(row);
  }

  var sheet = ss.getSheetByName(INVENTORY_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(INVENTORY_SHEET_NAME);
  sheet.clearContents();
  sheet.clearFormats();
  sheet.setConditionalFormatRules([]);

  sheet.getRange(1, 1, 1, outHeaders.length).setValues([outHeaders])
    .setFontWeight('bold').setBackground('#2E75B6').setFontColor('white');

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, outHeaders.length).setValues(rows);
    var mStart = 8;
    var mEnd = mStart + monthLabels.length - 1;
    sheet.getRange(2, 6, rows.length, 1).setNumberFormat('¥#,##0');
    sheet.getRange(2, 7, rows.length, 1).setNumberFormat('#,##0');
    sheet.getRange(2, mStart, rows.length, monthLabels.length).setNumberFormat('#,##0');
    sheet.getRange(2, mEnd + 1, rows.length, 1).setNumberFormat('#,##0');
    sheet.getRange(2, mEnd + 2, rows.length, 1).setNumberFormat('#,##0');
    sheet.getRange(2, mEnd + 3, rows.length, 1).setNumberFormat('0.0%');
    sheet.getRange(2, mStart, rows.length, monthLabels.length).setBackground('#EBF1FA');

    var range = sheet.getRange(2, mEnd + 3, rows.length, 1);
    var rules = [];
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenNumberGreaterThanOrEqualTo(0.8).setBackground('#C6EFCE').setFontColor('#006100')
      .setRanges([range]).build());
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenNumberLessThanOrEqualTo(0.3).setBackground('#FFC7CE').setFontColor('#9C0006')
      .setRanges([range]).build());
    sheet.setConditionalFormatRules(rules);
  }

  sheet.autoResizeColumns(1, outHeaders.length);
  sheet.setFrozenColumns(1);
  sheet.setFrozenRows(1);
  try {
    SpreadsheetApp.getUi().alert('在庫推移表: ' + rows.length + '型番');
  } catch(e) {
    Logger.log('在庫推移表: ' + rows.length + '型番');
  }
}

// ============================================================
// ② 消化率推移表（単独実行OK・軽量版）
// ★ 在庫推移シートから読み取るので CSV再読み込み不要
// ★ 投入月から開始、100%到達の翌月以降は空白
// ★ 書式設定を最小限にしてタイムアウト対策
// ============================================================
function generateDigestionTrend() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var invSheet = ss.getSheetByName(INVENTORY_SHEET_NAME);
  if (!invSheet || invSheet.getLastRow() < 2) {
    Logger.log('先に在庫推移表を生成してください');
    return;
  }

  // 必要な列だけ読み取る（全データ取得は重いので getDataRange を使う）
  var lastRow = invSheet.getLastRow();
  var lastCol = invSheet.getLastColumn();
  var invData = invSheet.getRange(1, 1, lastRow, lastCol).getValues();
  var invHeaders = invData[0];

  // 月カラムの範囲を特定
  var mStart = -1;
  var mEnd = -1;
  for (var c = 0; c < invHeaders.length; c++) {
    var h = String(invHeaders[c]);
    if (/^\d{4}-\d{2}$/.test(h)) {
      if (mStart === -1) mStart = c;
      mEnd = c;
    }
  }
  if (mStart === -1) {
    Logger.log('在庫推移表に月データが見つかりません');
    return;
  }
  var monthLabels = [];
  for (var c = mStart; c <= mEnd; c++) monthLabels.push(String(invHeaders[c]));

  var outHeaders = ['型番', 'カテゴリ', '仕入先', 'コラボ', '販売開始', '下代', '累計投入'];
  for (var m = 0; m < monthLabels.length; m++) outHeaders.push(monthLabels[m]);
  outHeaders.push('最新消化率');

  // --- データ構築 ---
  var rows = [];
  for (var r = 1; r < invData.length; r++) {
    var totalInput = parseInt(String(invData[r][6] || '0').replace(/[,\s]/g, ''), 10) || 0;
    if (totalInput === 0) continue;

    var launchRaw = String(invData[r][4] || '').trim();
    var launchMonth = '';
    if (launchRaw) {
      var lMatch = launchRaw.match(/(\d{4})-?(\d{1,2})/);
      if (lMatch) launchMonth = lMatch[1] + '-' + ('0' + lMatch[2]).slice(-2);
    }

    var row = [
      invData[r][0], invData[r][1], invData[r][2], invData[r][3],
      invData[r][4], invData[r][5], totalInput
    ];

    var latestRate = '';
    var reached100 = false;

    for (var c = mStart; c <= mEnd; c++) {
      var thisMonth = monthLabels[c - mStart];
      if (launchMonth && thisMonth < launchMonth) { row.push(''); continue; }
      if (reached100) { row.push(''); continue; }

      var stock = parseInt(String(invData[r][c] || '0').replace(/[,\s]/g, ''), 10) || 0;
      var sold = totalInput - stock;
      if (sold < 0) sold = 0;
      var rate = sold / totalInput;
      if (rate >= 1.0) {
        reached100 = true;
        row.push('');
      } else {
        row.push(rate);
        latestRate = rate;
      }
    }
    row.push(latestRate);
    rows.push(row);
  }

  // --- シート書き出し（API呼び出し最小限） ---
  var sheet = ss.getSheetByName(DIGESTION_TREND_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(DIGESTION_TREND_SHEET_NAME);
  sheet.clearContents();

  // ヘッダー + データを一括書き込み
  var allData = [outHeaders].concat(rows);
  sheet.getRange(1, 1, allData.length, outHeaders.length).setValues(allData);

  // ヘッダー書式
  sheet.getRange(1, 1, 1, outHeaders.length)
    .setFontWeight('bold').setBackground('#BF4B28').setFontColor('white');

  // 数値書式をまとめて設定（最小限のAPI呼び出し）
  if (rows.length > 0) {
    var dStart = 8;
    var dEnd = dStart + monthLabels.length - 1;
    var latestCol = dEnd + 1;

    // 月別消化率 + 最新消化率を一括で書式設定
    sheet.getRange(2, dStart, rows.length, monthLabels.length + 1).setNumberFormat('0.0%');
    sheet.getRange(2, 7, rows.length, 1).setNumberFormat('#,##0');
  }

  sheet.setFrozenColumns(1);
  sheet.setFrozenRows(1);
  Logger.log('消化率推移表: ' + rows.length + '型番');
}

// ============================================================
// ③ 上位店カテゴリー構成比サマリー
// CSVファイルから3店舗のカテゴリー別月次構成比を1シートにまとめる
// ============================================================
var CATEGORY_CSV_FILE_ID = '16AWWcxo2WgXvbeg8BoCZowFiO5VNzxSS';
var CATEGORY_SUMMARY_SHEET_NAME = '上位店カテゴリー構成比';

function generateCategorySummary() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var utils = getLocalUtils();

  // --- CSV読み込み ---
  var file = DriveApp.getFileById(CATEGORY_CSV_FILE_ID);
  var text = file.getBlob().getDataAsString('UTF-8');
  var lines = text.split(/\r?\n/);
  if (lines.length < 2) { Logger.log('CSVデータなし'); return; }

  // --- パース ---
  var headers = utils.parseCSVLine(lines[0]);
  var colShop = -1, colYear = -1, colMonth = -1, colCat = -1, colSales = -1, colRatio = -1;
  for (var h = 0; h < headers.length; h++) {
    var name = headers[h].replace(/[\s"]/g, '');
    if (name === 'ショップ名') colShop = h;
    if (name === '年') colYear = h;
    if (name === '月') colMonth = h;
    if (name === '第2カテゴリー') colCat = h;
    if (name === '売上額') colSales = h;
    if (name === '構成比') colRatio = h;
  }

  // shopData[shop][month][category] = { sales, ratio }
  var shopData = {};
  var allMonths = {};
  var shopOrder = [];

  for (var r = 1; r < lines.length; r++) {
    if (!lines[r].trim()) continue;
    var cols = utils.parseCSVLine(lines[r]);
    var shop = (cols[colShop] || '').replace(/"/g, '').trim();
    var month = parseInt(cols[colMonth] || '0', 10);
    var cat = (cols[colCat] || '').replace(/"/g, '').trim();
    var sales = parseInt(String(cols[colSales] || '0').replace(/[",]/g, ''), 10) || 0;
    var ratioStr = (cols[colRatio] || '').replace(/["%]/g, '').trim();
    var ratio = parseFloat(ratioStr) / 100 || 0;

    if (!shop || !cat || month === 0) continue;

    if (!shopData[shop]) { shopData[shop] = {}; shopOrder.push(shop); }
    if (!shopData[shop][month]) shopData[shop][month] = {};
    allMonths[month] = true;

    // 同じ月・カテゴリは上書き（CSVは構成比順なのでそのまま）
    shopData[shop][month][cat] = { sales: sales, ratio: ratio };
  }

  var months = Object.keys(allMonths).map(Number).sort(function(a, b) { return a - b; });

  // --- 各店舗のカテゴリー（構成比上位順） ---
  // 年間合計売上でカテゴリーをソート
  function getTopCategories(shop) {
    var catTotals = {};
    for (var m = 0; m < months.length; m++) {
      var md = shopData[shop][months[m]] || {};
      var cats = Object.keys(md);
      for (var c = 0; c < cats.length; c++) {
        if (!catTotals[cats[c]]) catTotals[cats[c]] = 0;
        catTotals[cats[c]] += md[cats[c]].sales;
      }
    }
    return Object.keys(catTotals).sort(function(a, b) { return catTotals[b] - catTotals[a]; });
  }

  // --- シート構築 ---
  var sheet = ss.getSheetByName(CATEGORY_SUMMARY_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(CATEGORY_SUMMARY_SHEET_NAME);
  sheet.clearContents();
  sheet.clearFormats();

  var monthHeaders = [];
  for (var m = 0; m < months.length; m++) monthHeaders.push(months[m] + '月');

  var allRows = [];
  var shopStartRows = []; // 各店舗の開始行（書式設定用）

  for (var s = 0; s < shopOrder.length; s++) {
    var shop = shopOrder[s];
    var categories = getTopCategories(shop);

    // 店舗ヘッダー行
    var shopHeaderRow = [shop];
    for (var p = 0; p < monthHeaders.length + 1; p++) shopHeaderRow.push('');
    allRows.push(shopHeaderRow);
    shopStartRows.push(allRows.length); // 次の行がデータヘッダー

    // カラムヘッダー
    var colHeader = ['カテゴリー'].concat(monthHeaders).concat(['年間平均']);
    allRows.push(colHeader);

    // データ行
    for (var c = 0; c < categories.length; c++) {
      var cat = categories[c];
      var row = [cat];
      var sum = 0;
      var cnt = 0;
      for (var m = 0; m < months.length; m++) {
        var md = shopData[shop][months[m]] || {};
        var val = md[cat] ? md[cat].ratio : '';
        row.push(val);
        if (val !== '') { sum += val; cnt++; }
      }
      row.push(cnt > 0 ? sum / cnt : '');
      allRows.push(row);
    }

    // 空行（店舗間）
    if (s < shopOrder.length - 1) {
      allRows.push([]);
    }
  }

  // --- 一括書き込み ---
  var totalCols = 1 + months.length + 1; // カテゴリー + 月数 + 年間平均
  if (allRows.length > 0) {
    sheet.getRange(1, 1, allRows.length, totalCols).setValues(allRows);
  }

  // --- 書式設定 ---
  var colors = ['#2E75B6', '#BF4B28', '#548235'];
  var currentRow = 1;
  for (var s = 0; s < shopOrder.length; s++) {
    var categories = getTopCategories(shopOrder[s]);
    var color = colors[s % colors.length];

    // 店舗名行
    sheet.getRange(currentRow, 1, 1, totalCols)
      .setFontWeight('bold').setFontSize(11).setBackground(color).setFontColor('white');
    sheet.getRange(currentRow, 1).setValue(shopOrder[s]);
    currentRow++;

    // ヘッダー行
    sheet.getRange(currentRow, 1, 1, totalCols)
      .setFontWeight('bold').setBackground('#F2F2F2');
    currentRow++;

    // データ行の構成比を%表示
    if (categories.length > 0) {
      sheet.getRange(currentRow, 2, categories.length, months.length + 1).setNumberFormat('0.0%');
    }
    currentRow += categories.length;

    // 空行スキップ
    if (s < shopOrder.length - 1) currentRow++;
  }

  sheet.autoResizeColumns(1, totalCols);
  sheet.setFrozenRows(0);
  sheet.setFrozenColumns(1);

  try {
    SpreadsheetApp.getUi().alert('上位店カテゴリー構成比: ' + shopOrder.length + '店舗');
  } catch(e) {
    Logger.log('上位店カテゴリー構成比: ' + shopOrder.length + '店舗');
  }
}
