// requestモジュールを使ってみる。
// https://www.npmjs.com/package/request
// npm install request
// encodingオプションにnullを設定することで、勝手に文字コード変換されるのを避けている。
'use strict';

var request = require('request');
var fs = require('fs');

var options = {
  url: 'http://httpbin.org/post',
  method: 'POST',
  form: {
    'name1': 'value1'
  },
  encoding: null,
  json: true
};

request(options, function(err, res, body) {
  if (err) throw err;
  console.log(res.statusCode);
  console.log(res.headers['content-type']);
  fs.writeFileSync('./request02_post_out.txt', JSON.stringify(body), 'binary');
});
