// 標準モジュールhttpを使ってみる。
// HTTPレスポンスのボディは、バイナリで受信する必要があるため、Bufferクラスを使う。
// HTTPレスポンスのボディにおける文字コードの考慮を省略するため、バイナリでファイル保存する。
'use strict';

var http = require('https');
var fs = require('fs');
var url = 'https://www.google.co.jp/search?q=node.js';

http.get(url, (res) => {
  var body = new Buffer([]);
  
  //console.log(res);
  console.log(res.statusCode);
  console.log(res.headers['content-type']);
  
  res.on('data', (chunk) => {
    body = Buffer.concat([body, chunk]);
  });
  
  res.on('end', () => {
    fs.writeFileSync('./http01_out.txt', body, 'binary');
  });
}).on('error', (e) => {
  console.log(e.message);
});
