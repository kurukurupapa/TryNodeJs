// Zaim APIを使ってみる。
// ・OAuth 1.0a で認証する仕様になっている。
// ・oauthモジュールを使用した。
//
// 事前作業
// ・oauthモジュールをインストール。
//   $ npm install oauth --save
// ・https://dev.zaim.net/ で当アプリケーションを登録し、
//   コンシューマID、コンシューマシークレット を取得する。
// ・次の環境変数を設定しておく。
//   export ZAIM_API_KEY=<取得したコンシューマID>
//   export ZAIM_API_SECRET=<取得したコンシューマシークレット>
//   export ZAIM_API_CALLBACK_URL=<上記で登録したコールバックURL>
//
// 参考
// ・Zaim Developers Center
//   https://dev.zaim.net/
// ・Node.jsでTumblr APIのAccess Tokenを取得する - Qiita
//   https://qiita.com/n0bisuke/items/c12963e0bde614443adf
// ・node-oauth/twitter-example.js at master · ciaranj/node-oauth · GitHub
//   https://github.com/ciaranj/node-oauth/blob/master/examples/twitter-example.js

'use strict';

var oauth = require('oauth');
var util = require('util');
var fs = require('fs');

var authUrl = 'https://auth.zaim.net/users/auth';
var requestTokenUrl = 'https://api.zaim.net/v2/auth/request';
var accessTokenUrl = 'https://api.zaim.net/v2/auth/access';
var consumerKey = process.env.ZAIM_API_KEY;
var consumerSecret = process.env.ZAIM_API_SECRET;
var callbackUrl = process.env.ZAIM_API_CALLBACK_URL;

var oauthObj = new oauth.OAuth(
  requestTokenUrl,
  accessTokenUrl,
  consumerKey,
  consumerSecret,
  '1.0a',
  callbackUrl,
  'HMAC-SHA1'
);

// リクエストトークン取得
var requestToken;
var requestTokenSecret;
function getOAuthRequestToken(callback) {
  oauthObj.getOAuthRequestToken((err, token, secret, results) => {
    if (err) throw util.inspect(err);
    requestToken = token;
    requestTokenSecret = secret;
    console.log(`token: ${token}`);
    console.log(`secret: ${secret}`);
    console.log(`results: ${util.inspect(results)}`);
    callback();
  });
}

// 認証・認可して Verifierを取得
var oauthVerifier;
function getVerifier(callback) {
  var url = `${authUrl}?oauth_token=${requestToken}`;
  console.log('１．次のURLをブラウザで開き、認証・認可を行ってください。');
  console.log(`Redirect URL: ${url}`);
  console.log('２．認可後の画面をソース表示し、main-contentクラス内のcodeタグから、Verifierを取得してください。');
  console.log('３．取得したVerifierを当コンソールに貼り付けてください。');
  
  var reader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  reader.on('line', function (line) {
    oauthVerifier = line;
    console.log(`Verifier: ${oauthVerifier}`);
    reader.close();
    callback();
  });
}

// アクセストークン取得
var accessToken;
var accessTokenSecret;
function getOAuthAccessToken(callback) {
  oauthObj.getOAuthAccessToken(requestToken, requestTokenSecret, oauthVerifier,
    (err, token, secret, results) => {
    if (err) throw util.inspect(err);
    accessToken = token;
    accessTokenSecret = secret;
    console.log(`token: ${token}`);
    console.log(`secret: ${secret}`);
    console.log(`results: ${util.inspect(results)}`);
    callback();
  });
}

// ユーザ情報を取得
function getUser(callback) {
  oauthObj.get('https://api.zaim.net/v2/home/user/verify',
    accessToken, accessTokenSecret, (err, body, res) => {
    if (err) throw util.inspect(err);
    //console.log(`body: ${util.inspect(body)}`);
    //console.log(`res: ${util.inspect(res)}`);
    var bodyJsonObj = JSON.parse(body);
    fs.writeFileSync('./zaimapi01_user.txt', JSON.stringify(bodyJsonObj), 'UTF-8');
    callback();
  });
}

// 明細情報を取得
function getMoney(callback) {
  var url = 'https://api.zaim.net/v2/home/money' +
    '?mapping=1' +
    '&start_date=2019-01-01&end_date=2019-12-31';
  oauthObj.get(url, accessToken, accessTokenSecret, (err, body, res) => {
    // bodyでは、UTF-8がunpack（文字列"\uXXXX"）されている。
    // JSON.parse(body)とするとpackされる。
    if (err) throw util.inspect(err);
    //console.log(`body: ${util.inspect(body)}`);
    //console.log(`res: ${util.inspect(res)}`);
    var bodyJsonObj = JSON.parse(body);
    fs.writeFileSync('./zaimapi01_money.txt', JSON.stringify(bodyJsonObj), 'UTF-8');
    callback();
  });
}

// 実行
getOAuthRequestToken(() => {
  getVerifier(() => {
    getOAuthAccessToken(() => {
      getUser(() => {
        getMoney(() => {
          console.log('Success.');
        });
      });
    });
  });
});
