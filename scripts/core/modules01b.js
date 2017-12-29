// モジュールを自作してみる。

// 2016/02/16 新規作成

module.exports.run = function() {
  console.log("Hello world.");
}

console.log("module01b.js");
console.log("__filename=" + __filename);
console.log("process.argv[0]=" + process.argv[0]);
console.log("process.argv[1]=" + process.argv[1]);

if (process.argv[1] == __filename) {
  console.log("modules01b.jsが直接起動されました。");
  module.exports.run();
} else {
  console.log("modules01b.jsがrequireされました。");
}
