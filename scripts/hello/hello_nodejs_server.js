// HelloWorldを表示するサーバ
//
// 実行方法
// node scripts/hello/hello_nodejs_server.js
//
// コピペ元
// nvm で作る Node.js の環境構築（+ Hello world） - blog @arfyasu http://arfyasu.hatenablog.com/entry/2016/01/26/212543

const http = require('http');
const hostname = '127.0.0.1';
const port = 8080;

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World\n');
}).listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
