# HelloWorldを表示するサーバ
#
# 事前準備
# npm install coffee-script
#
# スクリプト実行
# coffee scripts/hello/hello_coffee_server.coffee
#
# 参考
# HTTP | Node.js v4.8.6 Manual & Documentation https://nodejs.org/docs/latest-v4.x/api/http.html

http = require 'http'
port = 8080

server = http.createServer (req, res) =>
  console.log req.method, req.url
  res.writeHead 200,
    'Content-Type': 'text/plain'
  res.end "Hello World\n"
server.listen port, () =>
  console.log "Server running at http://localhost:#{port}/"
