// Node.jsの練習
// 2016/02/06

// 参考
// Node.js v4.2.6 Manual & Documentation
// https://nodejs.org/dist/latest-v4.x/docs/api/

var util = require("util");

// ------------------------------------------------------------
// コンソール出力
console.log("Hello world.");
console.info("Info log");
console.warn("Warn log");
console.error("Error log");
console.trace("Trace log"); //スタックトレースが出力される。

var infolog = require("util").log;
infolog("Hello world."); //タイムスタンプが出力される。

// デバッグログ
// export NODE_DEBUG=myapp
var debuglog = require("util").debuglog("myapp");
debuglog("デバッグログです。");

console.log();
// ------------------------------------------------------------
// ディレクトリ構成
console.log("カレントディレクトリ\n" + process.cwd());
console.log("スクリプトパス（絶対パス）\n" + __filename);
console.log("スクリプトディレクトリ\n" + __dirname);

var path = require("path");
console.log("スクリプトディレクトリ\n" + path.dirname(__filename));
console.log("スクリプト名\n" + path.basename(__filename));
console.log("スクリプト名（拡張子なし）\n" + path.basename(__filename, path.extname(__filename)));
console.log("スクリプト拡張子\n" + path.extname(__filename));

console.log("実行時引数\n", process.argv);
console.log("実行時引数の数\n", process.argv.length);
console.log("Node.jsコマンド\n" + process.argv[0]);
console.log("スクリプトパス\n" + process.argv[1]);

// console.log("モジュールサーチパス\n" + global.module.paths);

console.log();
// ------------------------------------------------------------
// Web Tips Plus: node.js ホームディレクトリのパスを取得
// http://webtipsplus.blogspot.jp/2015/05/nodejs.html

//ホームディレクトリのパスを取得
//Windowsは"USERPROFILE"、MacとLinuxは"HOME"を参照
var homedir = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];
console.log("ホームディレクトリ\n" + homedir);

//デスクトップのパス（pathモジュールの.joinで結合）
var path = require("path");
console.log("デスクトップディレクトリ\n" + path.join(homedir, "Desktop"));

console.log();
// ------------------------------------------------------------
// node.jsのいろいろなモジュール13 – node-configで設定ファイルを切り替えたりする ｜ Developers.IO
// http://dev.classmethod.jp/server-side/config/

var config = require("config");
console.log(config.test01);
console.log(config);
console.log(util.inspect(config));

console.log();
// ------------------------------------------------------------
// 正規表現

console.log("abcde12345".match(/bcd/g)); //-> [ 'bcd' ]
console.log("abcde12345".replace(/bcd/g, "BCD")); //=> aBCDe12345
