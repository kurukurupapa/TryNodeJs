// CSVデータを扱ってみる。

// 動作確認環境
// Node.js 4.2.6
// comma-separated-values 3.6.4

// 参考
// comma-separated-values
// https://www.npmjs.com/package/comma-separated-values

// 2016/02/20 新規作成

var data = ""
  + "h1,h2,h3\r\n"
  + "v11,v12,v13\r\n"
  + "v21,v22,v23\r\n"
  + "v31,v32,v33\r\n"
  ;

var CSV = require("comma-separated-values");

// CSVテキストを読み込み、2次元配列を作成する。
var csvArray = new CSV(data).parse();
console.log(csvArray);
// ->出力結果
// [ [ 'h1', 'h2', 'h3' ],
//   [ 'v11', 'v12', 'v13' ],
//   [ 'v21', 'v22', 'v23' ],
//   [ 'v31', 'v32', 'v33' ] ]

// CSVテキストを読み込み、オブジェクト配列を作成する。
var csvObjs = new CSV(data, {header:true}).parse();
console.log(csvObjs);
// ->出力結果
// [ { h1: 'v11', h2: 'v12', h3: 'v13' },
//   { h1: 'v21', h2: 'v22', h3: 'v23' },
//   { h1: 'v31', h2: 'v32', h3: 'v33' } ]

// オブジェクト配列を、CSVテキストに変換する。
var csvText = new CSV(csvObjs).encode();
console.log(csvText);
// ->出力結果
// "v11","v12","v13"
// "v21","v22","v23"
// "v31","v32","v33"
