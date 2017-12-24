// 引数のテキストを復号化する。
//
// 実行方法
// node crypto02.js 暗号化後文字列 暗号化キー
// 例：node crypto02.js 89cfe7572c20ae2540a3d9acd22de6f6 secret_key
//
// 2016/02/08 新規作成

var crypto = require("crypto");

if (process.argv.length != 4) {
  console.log("Usage: node crypto02.js 暗号化後文字列 暗号化キー");
  return;
}

// 対象テキスト
var cryptedText = process.argv[2];
console.log("復号化前: " + cryptedText);

// 暗号化キー
var key = process.argv[3];
console.log("暗号化キー: " + key);

// 復号化
var decipher = crypto.createDecipher("aes192", key);
var plainText = decipher.update(cryptedText, "hex", "utf8");
plainText += decipher.final("utf8");
console.log("復号化後: " + plainText);
