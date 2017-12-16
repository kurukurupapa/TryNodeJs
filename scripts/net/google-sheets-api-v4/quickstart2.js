// Node.jsからGoogleスプレッドシートを読み込んでみる。
// Google Sheets API v4を使用。
// いろいろアクセスしてみる。
//
// 元ネタ
// Node.js Quickstart  |  Sheets API  |  Google Developers
// https://developers.google.com/sheets/quickstart/nodejs?hl=ja
//
// 事前準備
// Google Developers Consoleから、OAuth 2.0 クライアント ID（client_secret.json）をダウンロードしておく。
// npm install googleapis --save
// npm install google-auth-library --save
//
// Usage
// node quickstart2.js スプレッドシートID シート名
// Googleが公開しているサンプルスプレッドシートにアクセス
// node quickstart2.js 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms "Class Data"
//
// 2017/12/03 新規作成

var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';
var CLIENT_SECRET_PATH = TOKEN_DIR + 'client_secret.json';

// スプレッドシートID、シート名
// 初期値はGoogleが公開しているサンプルスプレッドシート
var spreadsheetId = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';
var range = 'Class Data';
var endCallback = null;

// Load client secrets from a local file.
// ※client_secret.jsonの読み込み場所を変更しました。
function run() {
  fs.readFile(CLIENT_SECRET_PATH, function processClientSecrets(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      endCallback(err, null);
      return;
    }
    // Authorize a client with the loaded credentials, then call the
    // Google Sheets API.
    authorize(JSON.parse(content), listMajors);
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
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
function listMajors(auth) {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: spreadsheetId,
    // 日本語のシート名は「Request contains an invalid argument」となった。
    range: range,
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      endCallback(err, null);
      return;
    }
    endCallback(err, response);
  });
}

if (process.argv[1] == __filename)
  spreadsheetId = process.argv[2];
  range = process.argv[3];
  endCallback = function(err, response) {
    if (err) {
      return;
    }
    var rows = response.values;
    if (rows.length == 0) {
      console.log('No data found.');
    } else {
      console.log('行数='+rows.length+', 列数='+rows[0].length);
      for (var i = 0; i < rows.length; i++) {
        var line = rows[i].join(', ');
        console.log((i+1) + ': ' + line);
      }
    }
  }
  run();
