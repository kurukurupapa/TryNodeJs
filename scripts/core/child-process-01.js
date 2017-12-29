// 外部コマンド実行（非同期）の練習
//
// 前提
// ・Windows環境で実行する。
// ・iconv-liteパッケージをインストールしておく。
//
// 実行方法
// node child-process-01.js

var childProcess = require("child_process");
var iconv = require("iconv-lite");

// 非同期実行
console.log("START");
var result = childProcess.exec("dir",
  {
    encoding: "CP932",
    timeout: 60 * 100, // 1分
  },
  function(error, stdout, stderr){
    console.log("stdout: " + iconv.decode(stdout, "CP932")); //MS932だとエラー
    console.log("stderr: " + iconv.decode(stderr, "CP932"));
    console.log("error: " + error);
  }
);
//console.log(result);
console.log("END"); // 外部コマンド完了前に実行される。
