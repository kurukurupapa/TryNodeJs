// Google Tasks APIを使ってみる（更新系）
//
// 元ネタ
// Node.js Quickstart | Tasks API | Google Developers https://developers.google.com/google-apps/tasks/quickstart/nodejs#step_3_set_up_the_sample
// google-api-nodejs-client/v1.ts at master · google/google-api-nodejs-client https://github.com/google/google-api-nodejs-client/blob/master/src/apis/tasks/v1.ts
//
// 事前準備
// Google Developers Consoleから、OAuth 2.0 クライアント ID（client_secret.json）をダウンロードしておく。
// npm install googleapis --save
// npm install google-auth-library --save
//
// Usage
// node quickstart.js
// ※環境変数NODE_DEBUG=requestを設定しておくとHTTP通信の詳細が出力される。
'use strict';

var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var path = require('path');
var util = require('util');

var scriptDir = __dirname;
var scriptName = path.basename(__filename);
var baseName = path.basename(__filename, path.extname(__filename));
var d = new Date();
var dateStr = d.getFullYear()+('0'+(d.getMonth()+1)).slice(-2)+('0'+d.getDate()).slice(-2);
var timeStr = ('0'+d.getHours()).slice(-2)+('0'+d.getMinutes()).slice(-2)+('0'+d.getSeconds()).slice(-2);
var timestamp = dateStr+'-'+timeStr
var infolog = util.log;
var debuglog = util.debuglog(baseName);

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/tasks-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/tasks'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'tasks-nodejs-quickstart2.json';
var CLIENT_SECRET_PATH = TOKEN_DIR + 'client_secret.json';

// Load client secrets from a local file.
fs.readFile(CLIENT_SECRET_PATH, function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the
  // Google Tasks API.
  authorize(JSON.parse(content), processGTasks);
});

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
 * 更新系処理
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function processGTasks(auth) {
  let service = google.tasks('v1');

  // タスクリスト追加
  let tasklistTitle = 'Tasklist ' + timestamp;
  insertTasklist(service, auth, tasklistTitle, function(err, response){
    if (err) {
      throw new Error('The API returned an error: ' + err);
    }
    console.log('insertTasklist response=' + util.inspect(response));
    let tasklistId = response.id

    // タスク追加
    let taskTitle = 'Task ' + timestamp;
    let notes = "Notes\ntext1\ntext2"
    insertTask(service, auth, tasklistId, taskTitle, notes, function(err, response){
      if (err) {
        throw new Error('The API returned an error: ' + err);
      }
      console.log('insertTask response=' + util.inspect(response));

      // 結果確認 タスクリスト
      listTasklists2(service, auth, tasklistTitle, function(err, response){
        if (err) {
          throw new Error('The API returned an error: ' + err);
        }
        console.log('listTasklists2 response=' + util.inspect(response));

        // 結果確認 タスク
        listTasks2(service, auth, tasklistId, taskTitle, function(err, response){
          if (err) {
            throw new Error('The API returned an error: ' + err);
          }
          console.log('listTask2 response=' + util.inspect(response));
        });
      });
    });
  });
}

// タスクリストの一覧を取得する
function listTasklists(service, auth, callback) {
  service.tasklists.list({
    auth: auth
  }, function(err, response){
    debuglog('listTasklists err=' + err + ', response=' + util.inspect(response));
    callback(err, response);
  });
}

// タスクリストの一覧を取得する
// title - 抽出対象のタイトル
function listTasklists2(service, auth, title, callback) {
  listTasklists(service, auth, function(err, response){
    if (err) {
      callback(err, response);
      return;
    }
    let tasklists = response.items;
    let outTasklists = [];
    for (let i = 0; i < tasklists.length; i++) {
      let e = tasklists[i];
      if (e.title == title) {
        outTasklists.push(e);
      }
    }
    callback(null, {items:outTasklists});
  });
}

// タスクリストを追加する
// 同一タイトルのタスクがあってもエラーにならず追加できる。
function insertTasklist(service, auth, title, callback) {
  service.tasklists.insert({
    auth: auth,
    resource: {
      title: title
    }
  }, function(err, response){
    debuglog('insertTasklist err=' + err + ', response=' + util.inspect(response));
    callback(err, response);
  });
}

// タスク一覧を取得する
function listTasks(service, auth, tasklistId, callback) {
  service.tasks.list({
    auth: auth,
    showCompleted: false,
    tasklist: tasklistId
  }, function(err, response){
    debuglog('listTasks err=' + err + ', response=' + util.inspect(response));
    callback(err, response);
  });
}

// タスク一覧を取得する
// title - 抽出対象のタイトル
function listTasks2(service, auth, tasklistId, title, callback) {
  listTasks(service, auth, tasklistId, function(err, response){
    if (err) {
      callback(err, response);
      return;
    }
    let tasks = response.items;
    let outTasks = [];
    for (let i = 0; i < tasks.length; i++) {
      let e = tasks[i];
      if (e.title == title) {
        outTasks.push(e);
      }
    }
    callback(null, {items:outTasks});
  });
}

// タスクを追加する
function insertTask(service, auth, tasklistId, title, notes, callback) {
  service.tasks.insert({
    auth: auth,
    tasklist: tasklistId,
    resource: {
      title: title,
      notes: notes
    }
  }, function(err, response){
    debuglog('insertTask err=' + err + ', response=' + util.inspect(response));
    callback(err, response);
  });
}
