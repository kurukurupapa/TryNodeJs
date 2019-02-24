// requestモジュールを使ってみる。
// https://www.npmjs.com/package/request
// npm install request
// encodingオプションにnullを設定することで、勝手に文字コード変換されるのを避けている。
'use strict';

var request = require('request');
var fs = require('fs');
var url = 'https://www.google.co.jp/search?q=node.js';

request.get(url, {encoding: null}, function(err, res, body) {
  if (err) throw err;
  console.log(res.statusCode);
  console.log(res.headers['content-type']);
  fs.writeFileSync('./request01_out.txt', body, 'binary');
});
