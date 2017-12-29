// 標準入力を試す。

// 動作確認環境
// Windows 10
// Node.js 4.2.6

// 注意
// readlineだと、パイプの場合に、closeイベントが発生しないらしい。

// 参考
// Node.jsの標準入力と - Qiita
// http://qiita.com/hiroqn@github/items/c927bc97780c34eda562

// 2016/03/01 新規作成

var reader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

reader.on('line', function (line) {
  console.log("lineイベント");
  console.log(">" + line);

  if (line == "end") {
    reader.close();
  }
});

reader.on('close', function () {
  console.log("closeイベント");
});

console.log("入力してください。Ctrl+C or Ctrl+D or 'end' で終了します。");
