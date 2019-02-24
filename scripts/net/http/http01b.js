// 標準モジュールhttpを使ってみる。
// HTTPレスポンスのボディは、バイナリで受信する必要があるため、Bufferクラスを使う。
// HTTPレスポンスのボディにおける文字コードの考慮を省略するため、バイナリでファイル保存する。
// http01.jsとの違いは、URLを画像にしただけ。
'use strict';

var http = require('https');
var fs = require('fs');
var url = 'https://www.google.co.jp/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png';

http.get(url, (res) => {
  var body = new Buffer([]);
  
  //console.log(res);
  console.log(res.statusCode);
  console.log(res.headers['content-type']);
  
  res.on('data', (chunk) => {
    body = Buffer.concat([body, chunk]);
  });
  
  res.on('end', () => {
    fs.writeFileSync('./http01b_out.png', body, 'binary');
  });
}).on('error', (e) => {
  console.log(e.message);
});
