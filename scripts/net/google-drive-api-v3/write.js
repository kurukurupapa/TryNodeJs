// Node.jsからGoogleドライブへ書き込みしてみる。
//
// 参考
// Node.js Quickstart | Drive REST API | Google Developers https://developers.google.com/drive/v3/web/quickstart/nodejs?hl=ja
// API Reference  |  Drive REST API  |  Google Developers https://developers.google.com/drive/v3/reference/?hl=ja
// google/google-api-nodejs-client: https://github.com/google/google-api-nodejs-client/
//
// 事前準備
// Google Developers Consoleから、OAuth 2.0 クライアント ID（client_secret.json）をダウンロードしておく。
// npm install googleapis --save
// npm install google-auth-library --save
//
// Usage
// node write1.js
// ※環境変数NODE_DEBUG=requestを設定しておくとHTTP通信の詳細が出力される。

var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var util = require('util');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/drive-nodejs-quickstart.json
var SCOPES = [
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.file'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'drive-nodejs-quickstart.json';
var CLIENT_SECRET_PATH = TOKEN_DIR + 'client_secret.json';

// Load client secrets from a local file.
fs.readFile(CLIENT_SECRET_PATH, function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the
  // Drive API.
  authorize(JSON.parse(content), processGDrive);
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
 * GoogleDriveへ何かしらの処理を行う。
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function processGDrive(auth) {
  var drive = google.drive('v3');
  var func1 = function() {
    // ファイル一覧
    listFiles(auth, drive, func2);
  };
  var func2 = function() {
    // フォルダを作成する
    createFolder2(auth, drive, 'Folder01', 'root', function(file){
      // サブフォルダを作成する
      createFolder2(auth, drive, 'Sub01', file.id, function(file2){
        // ファイルを作成する
        createFile2(auth, drive, 'TextFile01', file2.id, function(file3){
          // ファイルを作成する
          createSheetFile2(auth, drive, 'SheetFile01', file2.id, function(){});
        });
      });
    });
  };
  func1();
}

// ファイル一覧取得
// Files: list  |  Drive REST API  |  Google Developers
// https://developers.google.com/drive/v3/reference/files/list
function listFiles(auth, drive, callback) {
  // webViewLink - ファイルプレビューリンク
  // webContentLink - ファイルダウンロードリンク
  drive.files.list({
    auth: auth,
    pageSize: 10,
    fields: "nextPageToken, files(id, name, webViewLink, webContentLink)"
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var files = response.files;
    if (files.length == 0) {
      console.log('No files found.');
    } else {
      console.log('Files:');
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        console.log('%s (%s)', file.name, file.id);
        console.log('file=' + util.inspect(file));
      }
      callback();
    }
  });
}

// ファイル/フォルダ一覧取得（存在チェック用）
// Files: list  |  Drive REST API  |  Google Developers
// https://developers.google.com/drive/v3/reference/files/list
function listFilesByName(auth, drive, name, parentId, callback) {
  var q = 'name=\"' + name + '\"';
  if (parentId) {
    q += ' and \"' + parentId + '\" in parents';
  }
  // ゴミ箱を対象外にする
  q += ' and trashed=false';

  drive.files.list({
    auth: auth,
    pageSize: 1,
    q: q,
    spaces: 'drive',
    fields: "files(id)"
  }, function(err, response) {
    console.log('---');
    if (err) {
      console.log('listFilesByName error: ' + err);
      return;
    }
    console.log('listFilesByName files=' + util.inspect(response.files));
    callback(response.files);
  });
}

// フォルダ作成
// Files: create  |  Drive REST API  |  Google Developers
// https://developers.google.com/drive/v3/reference/files/create
// ・既に存在するフォルダ名でも、別フォルダとして作成できる。
function createFolder(auth, drive, name, parentId, callback) {
  drive.files.create({
    auth: auth,
    resource: {
      name: name,
      parents: [parentId],
      mimeType: 'application/vnd.google-apps.folder'
    },
    fields: 'id'
  }, function(err, file) {
    console.log('---');
    if(err) {
      console.log('createFolder error: ' + err);
      console.log('createFolder name=' + name + ', parentId=' + parentId);
      return;
    }
    console.log('createFolder file=' + util.inspect(file));
    callback(file);
  });
}
function createFolder2(auth, drive, name, parentId, callback) {
  listFilesByName(auth, drive, name, parentId, function(files){
    if (files.length == 0) {
      createFolder(auth, drive, name, parentId, callback);
    } else {
      callback(files[0]);
    }
  });
};

// ファイル作成
// Files: create  |  Drive REST API  |  Google Developers
// https://developers.google.com/drive/v3/reference/files/create
// ・既に存在するフォルダ名でも、別フォルダとして作成できる。
function createFile(auth, drive, name, parentId, callback) {
  drive.files.create({
    auth: auth,
    resource: {
      name: name,
      parents: [parentId]
    },
    media: {
      mimeType: 'text/plain',
      body: 'Hello World'
    },
    fields: 'id, name'
  }, function(err, file) {
    console.log('---');
    if(err) {
      console.log('createFile error: ' + err);
      return;
    }
    console.log('createFile file=' + util.inspect(file));
    callback(file);
  });
}
function createSheetFile(auth, drive, name, parentId, callback) {
  drive.files.create({
    auth: auth,
    resource: {
      name: name,
      parents: [parentId],
      mimeType: 'application/vnd.google-apps.spreadsheet'
    },
    media: {
      mimeType: 'application/vnd.google-apps.spreadsheet'
    },
    fields: 'id, name'
  }, function(err, file) {
    console.log('---');
    if(err) {
      console.log('createSheetFile error: ' + err);
      return;
    }
    console.log('createSheetFile file=' + util.inspect(file));
    callback(file);
  });
}
function createFile2(auth, drive, name, parentId, callback) {
  listFilesByName(auth, drive, name, parentId, function(files){
    if (files.length == 0) {
      createFile(auth, drive, name, parentId, callback);
    } else {
      callback(files[0]);
    }
  });
}
function createSheetFile2(auth, drive, name, parentId, callback) {
  listFilesByName(auth, drive, name, parentId, function(files){
    if (files.length == 0) {
      createSheetFile(auth, drive, name, parentId, callback);
    } else {
      callback(files[0]);
    }
  });
}
