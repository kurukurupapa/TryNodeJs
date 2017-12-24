// 引数のテキストを暗号化する。
//
// 実行方法
// node crypto01.js 暗号化前文字列 暗号化キー
// 例：node crypto01.js secret_text secret_key
//
// 2016/02/08 新規作成

var crypto = require("crypto");

if (process.argv.length != 4) {
  console.log("Usage: node crypto01.js 暗号化前文字列 暗号化キー");
  return;
}

// 対象テキスト
var plainText = process.argv[2];
console.log("暗号化前: " + plainText);

// 暗号化キー
var key = process.argv[3];
console.log("暗号化キー: " + key);

// 暗号化
var cipher = crypto.createCipher("aes192", key);
var cryptedText = cipher.update(plainText, "utf8", "hex");
cryptedText += cipher.final("hex");
console.log("暗号化後: " + cryptedText);
