// パッケージgoogle-spreadsheetを使ってGoogleスプレッドシートを操作する。
// とりあえずパッケージサイトのサンプルスクリプトをほぼ丸コピーして動かしてみる。
//
// 事前準備
// 1. Google Developers Consoleでサービスアカウントキーを作成し、JSON形式でダウンロード。
// 2. テスト用のGoogleスプレッドシートを作成して、上記1のJSONに記述されているメールアドレスに共有設定。
//   さらに、スプレッドシートIDを控えておく。
// 3. スプレッドシートにヘッダー行（seq,name,comment）とデータ行を入力しておく。
//
// 補足
// ・環境変数NODE_DEBUG=requestを設定すると、HTTPリクエスト・レスポンスが出力されるようになる。
// ・スプレッドシートのヘッダー行にid,title,content,_xml,_linksなどのカラム名を付けると思い通りに動かない場合がある模様。
// 　addRowでidカラムに値を入れてもスプレッドシートへ反映されなかった。
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
    // ※getRowsと似たようなメソッドとして、getCellsがある。全セルを一律に処理するのに向いていそう。
    sheet.getRows(
      // オプションを色々指定できる。今回省略。
      // {
      //   offset: 1,
      //   limit: 20,
      //   orderby: 'col2'
      // },
      function( err, rows ){
      // rowsの詳細は、パッケージページの SpreadsheetRowクラス を参照。
      // 1行目がヘッダー行として扱われ、ヘッダーの名前で、各列にアクセスできる模様。
      console.log('Read '+rows.length+' rows');

      // 行の変更
      // ここでは、ヘッダーがseq,name,commentであり、データ行が2行以上である前提。
      // the row is an object with keys set by the column headers
      var now = new Date();
      var timestamp = now.getFullYear()+'/'+(now.getMonth()+1)+"/"+now.getDate()+'-'+now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
      rows[1].seq = parseInt(rows[1].seq) + 1;
      rows[1].name = 'Update';
      rows[1].comment = timestamp;
      rows[1].save(); // this is async

      // 行の削除
      // データ行が3行以上であること。
      // deleting a row
      rows[2].del();  // this is async

      step();
    });
  },
  function workingWithRows2(step) {
    console.log('--- workingWithRows2');
    var now = new Date();
    var timestamp = now.getFullYear()+'/'+(now.getMonth()+1)+"/"+now.getDate()+'-'+now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
    // 行の追加
    sheet.addRow({
      seq: 123,
      name: 'Add',
      comment: timestamp
    }, function(err, row) {
      console.log('row=' + util.inspect(row));
      step();
    });
  },
  function managingSheets(step) {
    console.log('--- managingSheets');
    doc.addWorksheet({
      title: 'my new sheet'
    }, function(err, sheet) {

      // change a sheet's title
      var now = new Date();
      var timestamp = now.getFullYear()+'/'+(now.getMonth()+1)+"/"+now.getDate()+'-'+now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
      sheet.setTitle('new title' + timestamp); //async

      //resize a sheet
      sheet.resize({rowCount: 50, colCount: 20}); //async

      sheet.setHeaderRow(['name', 'age', 'phone']); //async

      // removing a worksheet
      // sheet.del(); //async

      step();
    });
  }
], function(err){
    if( err ) {
      console.log('Error: '+err);
    }
});
