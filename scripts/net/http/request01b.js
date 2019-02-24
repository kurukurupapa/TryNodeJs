// requestモジュールを使ってみる。
// https://www.npmjs.com/package/request
// npm install request
// encodingオプションにnullを設定することで、勝手に文字コード変換されるのを避けている。
// request01.jsとの違いは、URLを画像にしただけ。
'use strict';

var request = require('request');
var fs = require('fs');
var url = 'https://www.google.co.jp/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png';

request.get(url, {encoding: null}, function(err, res, body) {
  if (err) throw err;
  console.log(res.statusCode);
  console.log(res.headers['content-type']);
  fs.writeFileSync('./request01b_out.png', body, 'binary');
});
