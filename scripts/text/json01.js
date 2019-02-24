// JSON・オブジェクト変換をしてみる。

// 動作確認環境
// Node.js 4.2.6

var obj = {
  "item1": "value1"
};

// オブジェクト→JSON変換
var jsonText = JSON.stringify(obj);
console.log(jsonText);

// JSON→オブジェクト変換
var jsonObj = JSON.parse(jsonText);
console.log(jsonObj);
