// iconv-liteを使ってみる。

// 動作確認環境
// Node.js 4.2.6
// iconv-lite 0.4.13

// 2016/02/20 新規作成

var iconv = require("iconv-lite");
var fs = require("fs");

fs.writeFileSync(
  "./iconv-lite-01_out.txt",
  iconv.encode("ハローワールド", "Shift_JIS"),
  "binary");

var text = iconv.decode(
  new Buffer(fs.readFileSync("./iconv-lite-01_out.txt", "binary"), "binary"),
  "Shift_JIS");
console.log(text);
