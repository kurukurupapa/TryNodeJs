// JSONファイルの読み書きをしてみる。

// 動作確認環境
// Node.js 4.3.2

function checkJsonObj(jsonobj) {
  console.log('---');
  console.log(jsonobj);
  console.log("number1=#{jsonobj.number1}");
  console.log("string1=#{jsonobj.string1}");
  console.log("array1[0]=#{jsonobj.array1[0]}");
  console.log("hash1.key1=#{jsonobj.hash1.key1}");
  console.log("hash1['key1']=#{jsonobj.hash1['key1']}");
  console.log("javascript1=#{jsonobj.javascript1}");
  eval(jsonobj.javascript1);
}

// requireで読み込み
var jsonObj = require('./data/json01');
checkJsonObj(jsonObj);

// fsで読み込み
var fs = require('fs');
var jsonStr = fs.readFileSync('./data/json01.json', 'utf8');
var jsonObj = JSON.parse(jsonStr);
checkJsonObj(jsonObj);
