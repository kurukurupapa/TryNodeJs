// 引数のテキストを暗号化/復号化する。
//
// 実行方法
// node crypto03.js アルゴリズム 暗号化キー 暗号化対象文字列
// 例：node crypto03.js aes256 secret_key secret_text
//
// 動作確認環境
// Node.js 4.2.6
//
// 2016/02/09 新規作成

var crypto = require("crypto");

if (process.argv.length != 5) {
  console.log("Usage: node crypto03.js アルゴリズム 暗号化キー 暗号化対象文字列");
  console.log("主要なアルゴリズム");
  console.log("aes128, aes192, aes256 - https://ja.wikipedia.org/wiki/Advanced_Encryption_Standard");
  console.log("des, des3 - https://ja.wikipedia.org/wiki/Data_Encryption_Standard");
  console.log("blowfish - https://ja.wikipedia.org/wiki/Blowfish");
  console.log("アルゴリズム一覧");
  var cipers = crypto.getCiphers();
  console.log(cipers);
  return;
}

// アルゴリズム
var algorithm = process.argv[2];
console.log("アルゴリズム: " + algorithm);

// 暗号化キー
var key = process.argv[3];
console.log("暗号化キー: " + key);

// 暗号化対象文字列
var plainText = process.argv[4];
console.log("暗号化前: " + plainText);

// 暗号化
var cipher = crypto.createCipher(algorithm, key);
var cryptedText = cipher.update(plainText, "utf8", "hex");
cryptedText += cipher.final("hex");
console.log("暗号化後: " + cryptedText);

// 復号化
var decipher = crypto.createDecipher(algorithm, key);
var decryptedText = decipher.update(cryptedText, "hex", "utf8");
decryptedText += decipher.final("utf8");
console.log("復号化後: " + decryptedText);
