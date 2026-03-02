// ============================================
// 入荷シートからデータを呼び出すGAS
// 呼び出し先スプレッドシートに設置
// ============================================

// --- 設定 ---
var SOURCE_SS_ID = '1lA-YceIi19Msm_d67xh-fqplDVZTnTEd9TaUKcntzIY'; // 入荷シートのID

// コピーしたいシート名と、呼び出し先での出力シート名
var SYNC_SHEETS = [
  { sourceName: '商品マスタ',           destName: '商品マスタ（入荷）' },
  { sourceName: 'カテゴリ別サマリー',    destName: 'カテゴリ別サマリー（入荷）' }
];


// ============================================
// メニュー
// ============================================
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📥 入荷データ取込')
    .addItem('入荷シートから最新データを取込', 'syncFromArrivalSheet')
    .addToUi();
}


// ============================================
// メイン: 入荷シートからデータを同期
// ============================================
function syncFromArrivalSheet() {
  var ui = SpreadsheetApp.getUi();
  var destSS = SpreadsheetApp.getActiveSpreadsheet();
  var sourceSS;

  try {
    sourceSS = SpreadsheetApp.openById(SOURCE_SS_ID);
  } catch (e) {
    ui.alert('エラー: 入荷シートにアクセスできません。\n\n' +
      '以下を確認してください:\n' +
      '・入荷シートのIDが正しいか\n' +
      '・入荷シートの共有設定でこのアカウントに閲覧権限があるか\n\n' +
      'エラー詳細: ' + e.message);
    return;
  }

  var results = [];

  for (var i = 0; i < SYNC_SHEETS.length; i++) {
    var config = SYNC_SHEETS[i];
    var result = syncOneSheet_(sourceSS, destSS, config.sourceName, config.destName);
    results.push(result);
  }

  ui.alert('取込完了\n\n' + results.join('\n'));
}


// ============================================
// 1シート分のデータをコピー
// ============================================
function syncOneSheet_(sourceSS, destSS, sourceName, destName) {
  var sourceSheet = sourceSS.getSheetByName(sourceName);

  if (!sourceSheet) {
    return '⚠ 「' + sourceName + '」が入荷シートに見つかりません。先に入荷シート側でMD管理→全て更新を実行してください。';
  }

  var lastRow = sourceSheet.getLastRow();
  var lastCol = sourceSheet.getLastColumn();

  if (lastRow === 0 || lastCol === 0) {
    return '⚠ 「' + sourceName + '」にデータがありません。';
  }

  // ソースからデータ取得（値+書式）
  var sourceRange = sourceSheet.getRange(1, 1, lastRow, lastCol);
  var values = sourceRange.getDisplayValues();
  var backgrounds = sourceRange.getBackgrounds();
  var fontColors = sourceRange.getFontColors();
  var fontWeights = sourceRange.getFontWeights();
  var numberFormats = sourceRange.getNumberFormats();

  // 出力先シートを取得 or 作成
  var destSheet = destSS.getSheetByName(destName);
  if (!destSheet) {
    destSheet = destSS.insertSheet(destName);
  } else {
    destSheet.clear();
    destSheet.clearFormats();
  }

  // 列数・行数を確保
  if (destSheet.getMaxColumns() < lastCol) {
    destSheet.insertColumnsAfter(destSheet.getMaxColumns(), lastCol - destSheet.getMaxColumns());
  }
  if (destSheet.getMaxRows() < lastRow) {
    destSheet.insertRowsAfter(destSheet.getMaxRows(), lastRow - destSheet.getMaxRows());
  }

  // データを書き込み
  var destRange = destSheet.getRange(1, 1, lastRow, lastCol);
  destRange.setValues(values);
  destRange.setBackgrounds(backgrounds);
  destRange.setFontColors(fontColors);
  destRange.setFontWeights(fontWeights);

  // 数値フォーマットを復元（表示値を書き込んでいるので、数値列だけ再設定）
  // ヘッダー行をフリーズ
  destSheet.setFrozenRows(1);

  // 列幅をソースに合わせる
  for (var c = 1; c <= lastCol; c++) {
    try {
      destSheet.setColumnWidth(c, sourceSheet.getColumnWidth(c));
    } catch (e) {}
  }

  // 不要な余白行・列を削除
  if (destSheet.getMaxRows() > lastRow + 1) {
    destSheet.deleteRows(lastRow + 1, destSheet.getMaxRows() - lastRow);
  }
  if (destSheet.getMaxColumns() > lastCol + 1) {
    destSheet.deleteColumns(lastCol + 1, destSheet.getMaxColumns() - lastCol);
  }

  // タイムスタンプをシート右上に記録
  var tsCell = destSheet.getRange(1, lastCol + 2);
  tsCell.setValue('最終取込: ' + Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm'));
  tsCell.setFontColor('#999999');
  tsCell.setFontSize(9);

  return '✅ 「' + sourceName + '」→「' + destName + '」: ' + lastRow + '行 × ' + lastCol + '列';
}


// ============================================
// 自動同期（トリガー設定用）
// ============================================
function autoSync() {
  syncFromArrivalSheet_silent_();
}

function syncFromArrivalSheet_silent_() {
  var destSS = SpreadsheetApp.getActiveSpreadsheet();
  var sourceSS;

  try {
    sourceSS = SpreadsheetApp.openById(SOURCE_SS_ID);
  } catch (e) {
    Logger.log('入荷シートにアクセスできません: ' + e.message);
    return;
  }

  for (var i = 0; i < SYNC_SHEETS.length; i++) {
    var config = SYNC_SHEETS[i];
    var result = syncOneSheet_(sourceSS, destSS, config.sourceName, config.destName);
    Logger.log(result);
  }
}
