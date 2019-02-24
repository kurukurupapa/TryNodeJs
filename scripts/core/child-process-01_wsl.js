// 外部コマンド実行（非同期）の練習
//
// 前提
// ・Windows Subsystem for Linux（WSL）環境で実行する。
// ・iconv-liteパッケージをインストールしておく。
//
// 実行方法
// node child-process-01_wsl.js

const childProcess = require("child_process");
const iconv = require("iconv-lite");

// 非同期実行
console.log("START");
var result = childProcess.exec("ls -l",
  {
    encoding: "CP932",
    timeout: 60 * 100, // 1分
  },
  function(error, stdout, stderr){
    console.log("stdout: " + iconv.decode(stdout, "UTF-8"));
    console.log("stderr: " + iconv.decode(stderr, "UTF-8"));
    console.log("error: " + error);
  }
);
//console.log(result);
console.log("END"); // 外部コマンド完了前に実行される。
