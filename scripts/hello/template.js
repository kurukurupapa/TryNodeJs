// テンプレートファイル
//
// 実行方法
// set NODE_DEBUG=template
// node template.js

var assert = require('assert');
var path = require('path');
var util = require('util');

var scriptDir = __dirname;
var scriptName = path.basename(__filename);
var baseName = path.basename(__filename, path.extname(__filename));
var d = new Date();
var dateStr = d.getFullYear()+('0'+(d.getMonth()+1)).slice(-2)+('0'+d.getDate()).slice(-2);
var timeStr = ('0'+d.getHours()).slice(-2)+('0'+d.getMinutes()).slice(-2)+('0'+d.getSeconds()).slice(-2);
var timestamp = dateStr+'-'+timeStr;
var infolog = util.log;
var debuglog = util.debuglog(baseName);

// 初期処理
debuglog(scriptName + ' START');

// 引数解析
var help = process.argv.length <= 2 || process.argv[2] == '-h';
if (help) {
  console.log('Usage: node ' + scriptName);
  return;
}

// 主処理
// ▼▼▼ここに処理を書きます
debuglog("カレントディレクトリ：" + process.cwd());
for (var i = 0; i < process.argv.length; i++) {
  console.log('argv ' + i + ": " + process.argv[i]);
}
// ▲▲▲ここに処理を書きます

// 終了処理
debuglog(scriptName + ' END');
