// Node.jsからGoogleスプレッドシートを書き込んでみる。
// Google Sheets API v4を使用。
//
// 参考
// Sheets API | Google Developers https://developers.google.com/sheets/?hl=ja
// Google Sheets APIでセルの値を書き込む方法 - Qiita https://qiita.com/howdy39/items/c28c0328038d9c43f389
//
// 事前準備
// Google Developers Consoleから、OAuth 2.0 クライアント ID（client_secret.json）をダウンロードしておく。
// npm install googleapis --save
// npm install google-auth-library --save
//
// Usage
// node write.js

var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-write.json';
var CLIENT_SECRET_PATH = TOKEN_DIR + 'client_secret.json';

var endCallback = null;

// Load client secrets from a local file.
// ※client_secret.jsonの読み込み場所を変更しました。
function run() {
  fs.readFile(CLIENT_SECRET_PATH, function processClientSecrets(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      return;
    }
    // Authorize a client with the loaded credentials, then call the
    // Google Sheets API.
    authorize(JSON.parse(content), processGSheets);
  });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Googleスプレッドシートの書き込み処理
 */
function processGSheets(auth) {
  var sheets = google.sheets('v4');
  var func1 = function(){
    // スプレッドシートファイル作成
    // シートIDの初期値は0になる模様。
    createSpreadsheet(auth, sheets, function(response1){
      var spreadsheetId = response1.spreadsheetId;
      var sheetId = response1.sheets[0].properties.sheetId;
      // ファイル名変更
      var now = new Date();
      var title = response1.properties.title + '_' + now.getFullYear()+'/'+(now.getMonth()+1)+"/"+now.getDate()+'-'+now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
      updateSpreadsheetTitle(auth, sheets, spreadsheetId, title, function(response2){
        // シート追加
        var sheetName = 'Sheet01';
        addSheet(auth, sheets, spreadsheetId, sheetName, function(){
          // セルの書き込み UpdateCellsRequest方式
          updateCells(auth, sheets, spreadsheetId, sheetId, function(){
            // セルの書き込み Values.batchUpdate方式
            updateValues(auth, sheets, spreadsheetId, sheetName, function(){
              // 値の追加 AppendCellsRequest方式
              appendCells(auth, sheets, spreadsheetId, sheetId, function(){
                // 値の追加 Values.append方式
                appendValues(auth, sheets, spreadsheetId, sheetName, function(){
                  // 結果確認
                  getSpreadsheet(auth, sheets, spreadsheetId, function(){
                    getValues(auth, sheets, spreadsheetId, sheetName, function(){});
                  })
                });
              });
            });
          });
        });
      });
    });
  };
  func1();
}

// スプレッドシートの情報を取得する
function getSpreadsheet(auth, sheets, spreadsheetId, callback) {
  sheets.spreadsheets.get({
    auth: auth,
    spreadsheetId: spreadsheetId
  }, function(err, response) {
    console.log('--- getSpreadsheet');
    if (err) {
      console.log('getSpreadsheet error: ' + err);
      return;
    }
    console.log(JSON.stringify(response, null, 2));
    callback(response);
  });
}

// セルの読み込み
function getValues(auth, sheets, spreadsheetId, range, callback) {
  // ここでは単一範囲（全量を一括で）の読み取りを行う。
  // 複数範囲を読み取りたいときはsheets.spreadsheets.values.batchGetが使える。
  sheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: spreadsheetId,
    range: range,
  }, function(err, response) {
    console.log('--- getValues');
    if (err) {
      console.log('getValues error: ' + err);
      return;
    }
    var rows = response.values;
    console.log('行数='+rows.length+', 列数='+rows[0].length);
    for (var i = 0; i < rows.length; i++) {
      var line = rows[i].join(', ');
      console.log((i+1) + ': ' + line);
    }
    callback();
  });
}

// スプレッドシートの作成
// マイドライブ直下に作成される。
// 作成先のフォルダを指定したいときは、Google Drive APIを使用する。
function createSpreadsheet(auth, sheets, callback) {
  // googleapis Namespace: sheets http://google.github.io/google-api-nodejs-client/22.2.0/sheets#.sheets.spreadsheets.create__anchor
  // <static> sheets.spreadsheets.create(params [, options], callback)
  //
  // Google Sheets API への移行 | Sheets API | Google Developers https://developers.google.com/sheets/guides/migration?hl=ja
  // スプレッドシートの作成
  // POST https://sheets.googleapis.com/v4/spreadsheets
  // {
  //   "properties": {"title": "NewTitle"}
  // }
  //
  // Googleスプレッドシートをプログラムから操作 - Qiita https://qiita.com/howdy39/items/ca719537bba676dce1cf
  // スプレッドシートを作成するAPIを実行
  // POST https://sheets.googleapis.com/v4/spreadsheets
  sheets.spreadsheets.create({
    auth: auth,
    resource: {
      // titleを指定しないときは、デフォルトの名前「無題のスプレッドシート」で作成される。
      "properties": {"title": "NewTitle"}
    }
  }, function(err, response) {
    console.log('--- createSpreadsheet');
    if (err) {
      console.error('createSpreadsheet error: ' + err);
      return;
    }
    console.log(JSON.stringify(response, null, 2));
    callback(response);
  });
}

// スプレッドシートのファイル名変更
function updateSpreadsheetTitle(auth, sheets, spreadsheetId, title, callback) {
  // googleapis Namespace: sheets http://google.github.io/google-api-nodejs-client/22.2.0/sheets#.sheets.spreadsheets.batchUpdate__anchor
  // <static> sheets.spreadsheets.batchUpdate(params [, options], callback)
  //
  // Googleスプレッドシートをプログラムから操作 - Qiita https://qiita.com/howdy39/items/ca719537bba676dce1cf
  // POST https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}:batchUpdate
  // {
  //   "requests": [
  //     {
  //       "updateSpreadsheetProperties": {
  //         "properties": {
  //           "title": "成績表"
  //         },
  //         "fields": "title"
  //       }
  //     }
  //   ]
  // }
  sheets.spreadsheets.batchUpdate({
    auth: auth,
    spreadsheetId: spreadsheetId,
    resource: {
      requests: [{
        updateSpreadsheetProperties: {
          properties: {
            title: title
          },
          fields: 'title'
        }
      }]
    }
  }, function(err, response) {
    console.log('--- updateSpreadsheetTitle');
    if (err) {
      console.error('updateSpreadsheetTitle error: ' + err);
      return;
    }
    console.log(JSON.stringify(response, null, 2));
    callback(response);
  });
}

// シートの追加
function addSheet(auth, sheets, spreadsheetId, title, callback) {
  sheets.spreadsheets.batchUpdate({
    auth: auth,
    spreadsheetId: spreadsheetId,
    resource: {
      requests: [{
        "addSheet": {
          "properties": {
            "title": title
          }
        }
      }]
    }
  }, function(err, response) {
    console.log('--- addSheet');
    if (err) {
      console.error('addSheet error: ' + err);
      return;
    }
    console.log(JSON.stringify(response, null, 2));
    callback(response);
  });
}

// セルの書き込み UpdateCellsRequest方式
// この方式だと、複数範囲の書き込み、セルの書式設定が可能。
function updateCells(auth, sheets, spreadsheetId, sheetId, callback) {
  // Google Sheets APIでセルの値を書き込む方法 - Qiita https://qiita.com/howdy39/items/c28c0328038d9c43f389
  // その１ UpdateCellsRequest
  // POST https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}:batchUpdate
  // {
  //   "requests": [
  //     {
  //       "updateCells": {
  //         "range": {
  //             "sheetId": 0,
  //             "startRowIndex": 0,
  //             "endRowIndex": 1,
  //             "startColumnIndex": 0,
  //             "endColumnIndex": 4
  //         },
  //         "rows": [
  //             {
  //               "values": [
  //                 { "userEnteredValue": { "stringValue": "文字列"} },
  //                 { "userEnteredValue": { "numberValue": 12345} },
  //                 { "userEnteredValue": { "boolValue": false} },
  //                 { "userEnteredValue": { "formulaValue": "=B1"} },
  //             ],
  //           },
  //         ],
  //         "fields": "userEnteredValue"
  //       }
  //     }
  //   ]
  // }
  //
  // Googleスプレッドシートをプログラムから操作 - Qiita https://qiita.com/howdy39/items/ca719537bba676dce1cf
  // データを書き込む
  // {
  //   "requests": [
  //     {
  //       "updateCells": {
  //         "start": {
  //             "sheetId": 0,
  //             "rowIndex": 0,
  //             "columnIndex": 0
  //         },
  //         "rows": [
  //           {
  //             "values": [
  //               {}, //空セル？
  //               {
  //                 "userEnteredValue": {
  //                   "stringValue": "国語"
  //                 }
  //               },
  //               (省略)
  //             ],
  //           },
  //           (省略)
  //         ],
  //         "fields": "userEnteredValue"
  //       }
  //     }
  //   ]
  // }
  sheets.spreadsheets.batchUpdate({
    auth: auth,
    spreadsheetId: spreadsheetId,
    resource: {
      requests: [{
        updateCells: {
          range: {
            sheetId: sheetId,
            startRowIndex: 0,
            startColumnIndex: 0
          },
          rows: [{
            values: [
              {userEnteredValue: {stringValue: "UpdateCellsRequest方式" }},
              {userEnteredValue: {stringValue: "b1" }},
              {userEnteredValue: {stringValue: "c1" }}
            ]
          }, {
            values: [
              {userEnteredValue: {numberValue: "123" }},
              {userEnteredValue: {boolValue: false }},
              {userEnteredValue: {formulaValue: "=B1" }}
            ]
          }],
          fields: 'userEnteredValue'
        }
      }, {
        updateCells: {
          range: {
            sheetId: sheetId,
            startRowIndex: 0,
            startColumnIndex: 5
          },
          rows: [{
            values: [
              {userEnteredValue: {stringValue: "UpdateCellsRequest方式 範囲2" }},
            ]
          }],
          fields: 'userEnteredValue'
        }
      }]
    }
  }, function(err, response) {
    console.log('--- updateCells');
    if (err) {
      console.error('updateCells error: ' + err);
      return;
    }
    console.log(JSON.stringify(response, null, 2));
    callback(response);
  });
}

// セルの書き込み Values.batchUpdate方式
// この方式だと、複数範囲の書き込みが可能。セル書式は不可。
function updateValues(auth, sheets, spreadsheetId, sheetName, callback) {
  // 複数範囲の書き込み
  // 単一範囲の書き込みでよければ、sheets.spreadsheets.values.updateが使える。
  //
  // googleapis Namespace: sheets http://google.github.io/google-api-nodejs-client/22.2.0/sheets#.sheets.spreadsheets.values.batchUpdate__anchor
  // <static> sheets.spreadsheets.values.batchUpdate(params [, options], callback)
  //
  // Google Sheets APIでセルの値を書き込む方法 - Qiita https://qiita.com/howdy39/items/c28c0328038d9c43f389
  // POST https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values:batchUpdate
  // {
  //   "valueInputOption": "USER_ENTERED",
  //   "data": [
  //     {
  //       "range": "'シート2'!B2:B7",
  //       "majorDimension": "COLUMNS",
  //       "values": [
  //         [
  //           100,
  //           "'100",
  //           "=A1",
  //           42892,
  //           true,
  //           "'true",
  //         ]
  //       ],
  //     },
  //     {
  //       "range": "'シート2'!C2:C7",
  //       "majorDimension": "COLUMNS",
  //       "values": [
  //         [
  //           "C2",
  //           "C3",
  //           "C4",
  //           "C5",
  //           "C6",
  //           "C7",
  //         ]
  //       ],
  //     }
  //   ],
  //   "includeValuesInResponse": true,
  //   "responseValueRenderOption": "UNFORMATTED_VALUE",
  //   "responseDateTimeRenderOption": "FORMATTED_STRING",
  // }
  sheets.spreadsheets.values.batchUpdate({
    auth: auth,
    spreadsheetId: spreadsheetId,
    resource: {
      valueInputOption: 'USER_ENTERED',
      data: [{
        range: sheetName + "!B2:D3",
        values: [
          ['Values.batchUpdate方式', 'b1', 'c1'],
          [223, true, '=C6']
        ]
      }, {
        range: sheetName + "!F2:F2",
        values: [
          ['Values.batchUpdate方式 範囲2']
        ]
      }]
    }
  }, function(err, response) {
    console.log('--- updateValues');
    if (err) {
      console.error('updateValues error: ' + err);
      return;
    }
    console.log(JSON.stringify(response, null, 2));
    callback(response);
  });
}

// データの追加 AppendCellsRequest方式
// セルの書式設定可能。
// Requests | Sheets API | Google Developers https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/request
// AppendCellsRequest
function appendCells(auth, sheets, spreadsheetId, sheetId, callback) {
  sheets.spreadsheets.batchUpdate({
    auth: auth,
    spreadsheetId: spreadsheetId,
    resource: {
      requests: [{
        appendCells: {
          sheetId: sheetId,
          rows: [{
            values: [
              {userEnteredValue: {stringValue: "AppendCellsRequest方式" }},
              {userEnteredValue: {stringValue: "B1" }},
              {userEnteredValue: {stringValue: "C1" }},
              {userEnteredValue: {stringValue: "D1" }}
            ]
          }, {
            values: [
              {userEnteredValue: {stringValue: "A2" }},
              {userEnteredValue: {numberValue: "123" }},
              {userEnteredValue: {boolValue: false }},
              {userEnteredValue: {formulaValue: "=B1" }}
            ]
          }],
          fields: 'userEnteredValue'
        }
      }]
    }
  }, function(err, response) {
    console.log('--- appendCells');
    if (err) {
      console.error('appendCells error: ' + err);
      return;
    }
    console.log(JSON.stringify(response, null, 2));
    callback(response);
  });
}

// データの追加 Values.append方式
// セルの書式設定不可。
// Method: spreadsheets.values.append | Sheets API | Google Developers https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/append
function appendValues(auth, sheets, spreadsheetId, range, callback) {
  sheets.spreadsheets.values.append({
    auth: auth,
    spreadsheetId: spreadsheetId,
    range: range,
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [
        ['Values.append方式', 'B1', 'C1', 'D1'],
        [223, true, '=C2']
      ]
    }
  }, function(err, response) {
    console.log('--- appendValues');
    if (err) {
      console.error('appendValues error: ' + err);
      return;
    }
    console.log(JSON.stringify(response, null, 2));
    callback(response);
  });
}

if (process.argv[1] == __filename)
  run();
