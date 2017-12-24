// ファイル入出力してみる。
//
// 2016/02/20 新規作成

var fs = require("fs");

// 書き込み
fs.writeFileSync("./file01_out.txt", "ハローワールド", {encoding:"UTF-8"});

// 読み込み
var text = fs.readFileSync("./file01_out.txt", {encoding:"UTF-8"});
console.log(text);
