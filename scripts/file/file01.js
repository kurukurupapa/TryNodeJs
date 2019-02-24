// ファイル入出力してみる。
//
// 2016/02/20 新規作成

var fs = require("fs");

// 書き込み（同期）
fs.writeFileSync("./file01_out.txt", "ハローワールド", {encoding:"UTF-8"});

// 書き込み（非同期）
fs.writeFile("./file02_out.txt", "ハローワールド", {encoding:"UTF-8"}, (err) => {
  if (err) throw err;
  console.log('Saved!');
});

// 読み込み（同期）
var text = fs.readFileSync("./file01_out.txt", {encoding:"UTF-8"});
console.log(text);

// 読み込み（非同期）
fs.readFile("./file01_out.txt", {encoding:"UTF-8"}, (err, text2) => {
  if (err) throw err;
  console.log(text2);
});
