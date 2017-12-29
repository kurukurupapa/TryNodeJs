// 外部コマンド実行（同期）の練習
//
// 前提
// ・Windows環境で実行する。
// ・iconv-liteパッケージをインストールしておく。
//
// 実行方法
// node child-process-02.js

var childProcess = require("child_process");
var iconv = require("iconv-lite");

// 同期実行
console.log("START");
var buffer = childProcess.execSync("dir",
  {
    // encoding: "MS932", //-> エラー
    // encoding: "Shift_JIS", //-> エラー
    // encoding: "UTF-8", //-> OK。だけど文字化けする。
    timeout: 60 * 1000, // 1分
  }
);
console.log(iconv.decode(buffer, "Shift_JIS"));
console.log("END");
