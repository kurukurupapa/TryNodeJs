// asyncモジュールを利用して、同期処理をしてみる。

// 動作確認環境
// Windows 10
// node 4.2.6
// async 1.5.2

// 参考
// node.jsのいろいろなモジュール17 – asyncで非同期処理のフロー制御 ｜ Developers.IO
// http://dev.classmethod.jp/server-side/asyn/

// 2016/02/19 新規作成

var async = require("async");

console.info("START");

async.series(
  // 引数1：順番に実行する関数の配列
  [
    function(callback){
      console.info("関数1");
      callback(null, "結果1"); //これを書かないと、後続関数が呼ばれない。
    },
    function(callback){
      console.info("関数2");
      callback(null, "結果2");
    },
    function(callback){
      console.info("関数3");
      // throw "関数3エラー"; //関数4がスキップされ、最終関数が実行される。
      callback(null, "結果3");
    },
    function(callback){
      console.info("関数4");
      callback(null, "結果4");
    },
  ],
  // 引数2：最後に実行する関数
  function(err, results){
    if (err) {
      throw err;
    }
    console.info("最終関数");
    console.info(results); //-> [ '結果1', '結果2', '結果3', '結果4' ]
  }
);

console.info("END");
