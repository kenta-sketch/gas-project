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

// --- 在庫データ読み込み ---
function loadInventoryData() {
  var utils = getLocalUtils();
  var folder = DriveApp.getFolderById(INVENTORY_FOLDER_ID);
  var files = folder.getFiles();
  var allFiles = [];
  while (files.hasNext()) {
    var f = files.next();
    if (f.getName().indexOf('在庫データ') !== -1) allFiles.push(f);
  }
  allFiles.sort(function(a, b) { return a.getName().localeCompare(b.getName()); });

  var monthLabels = [];
  var monthDataMap = {};

  for (var i = 0; i < allFiles.length; i++) {
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

  monthLabels.sort();

  var allModels = {};
  for (var m = 0; m < monthLabels.length; m++) {
    var keys = Object.keys(monthDataMap[monthLabels[m]]);
    for (var k = 0; k < keys.length; k++) {
      if (keys[k].trim()) allModels[keys[k]] = true;
    }
  }

  return { monthLabels: monthLabels, monthDataMap: monthDataMap, allModels: allModels };
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
// ① 在庫推移表（単独実行OK）
// ============================================================
function generateInventoryTrend() {
  var utils = getLocalUtils();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var inv = loadInventoryData();
  var masterMap = loadMasterMap();
  var monthLabels = inv.monthLabels;
  var monthDataMap = inv.monthDataMap;
  var modelKeys = Object.keys(inv.allModels).sort();

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
