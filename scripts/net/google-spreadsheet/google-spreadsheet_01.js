// パッケージgoogle-spreadsheetを使ってGoogleスプレッドシートを操作する。
// とりあえずパッケージサイトのサンプルスクリプトをほぼ丸コピーして、参照処理のみにして、動かしてみる。
//
// 事前準備
// 1. Google Developers Consoleでサービスアカウントキーを作成し、JSON形式でダウンロード。
// 2. テスト用のGoogleスプレッドシートを作成して、上記1のJSONに記述されているメールアドレスに共有設定。
//   さらに、スプレッドシートIDを控えておく。
//
// 補足
// ・環境変数NODE_DEBUG=requestを設定すると、HTTPリクエスト・レスポンスが出力されるようになる。
//
// パッケージgoogle-spreadsheet
// google-spreadsheet https://www.npmjs.com/package/google-spreadsheet
// A simple Node.js module for reading and manipulating data in Google Spreadsheets.
// npm install google-spreadsheet --save

if (process.argv.length != 3) {
  console.log('Usage: node google-spreadsheet-01.js スプレッドシートID');
  return;
}
var spreadsheetId = process.argv[2];
var util = require('util');

// Google Developers Consoleで作成したサービスアカウントキーファイル
var credentialDir = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
var credentialPath = credentialDir + 'google-generated-creds.json';

var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');

// spreadsheet key is the long id in the sheets URL
var doc = new GoogleSpreadsheet(spreadsheetId);
var sheet;

async.series([
  function setAuth(step) {
    console.log('--- setAuth');
    // see notes below for authentication instructions!
    var creds = require(credentialPath);
    // // OR, if you cannot save the file locally (like on heroku)
    // var creds_json = {
    //   client_email: 'yourserviceaccountemailhere@google.com',
    //   private_key: 'your long private key stuff here'
    // }
    doc.useServiceAccountAuth(creds, step);
  },
  function getInfoAndWorksheets(step) {
    console.log('--- getInfoAndWorksheets');
    doc.getInfo(function(err, info) {
      if (err) {
        console.log('err='+err);
        return;
      }
      // infoの詳細は、パッケージページの GoogleSpreadsheet.getInfo(callback) を参照。
      console.log('Loaded doc: '+info.title+' by '+info.author.email);
      for (var i in info.worksheets) {
        // sheetの詳細は、パッケージページの SpreadsheetWorksheetクラス を参照。
        sheet = info.worksheets[i];
        console.log('sheet['+i+']: '+sheet.title+' '+sheet.rowCount+'x'+sheet.colCount);
      }
      sheet = info.worksheets[0];
      step();
    });
  },
  function workingWithRows(step) {
    console.log('--- workingWithRows');
    // google provides some query options
    sheet.getRows(function( err, rows ){
      // rowsの詳細は、パッケージページの SpreadsheetRowクラス を参照。
      // 1行目がヘッダー行として扱われ、ヘッダーの名前で、各列にアクセスできる模様。
      // ここでは、ヘッダーがid,name,commentである前提。
      console.log('Read '+rows.length+' rows');
      for (var i in rows) {
        var row = rows[i];
        console.log('rows['+i+']: '+row.id+', '+row.name+', '+row.comment);
      }
      step();
    });
  },
  function workingWithCells(step) {
    console.log('--- workingWithCells');
    sheet.getCells(function(err, cells) {
      // cellsの詳細は、パッケージページのSpreadsheetCellクラスを参照。
      for (var i in cells) {
        var cell = cells[i];
        console.log('Cell R'+cell.row+'C'+cell.col+'='+cell.value);
        // console.log('cells['+i+']='+util.inspect(cell));
      }
      step();
    });
  }
], function(err){
    if( err ) {
      console.log('Error: '+err);
    }
});
