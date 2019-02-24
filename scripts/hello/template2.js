// テンプレートファイル
//
// 実行方法
// export NODE_DEBUG=template2
// node template.js

const assert = require('assert');
const path = require('path');
const util = require('util');

const scriptDir = __dirname;
const scriptName = path.basename(__filename);
const baseName = path.basename(__filename, path.extname(__filename));
const d = new Date();
const dateStr = d.getFullYear()+('0'+(d.getMonth()+1)).slice(-2)+('0'+d.getDate()).slice(-2);
const timeStr = ('0'+d.getHours()).slice(-2)+('0'+d.getMinutes()).slice(-2)+('0'+d.getSeconds()).slice(-2);
const timestamp = dateStr+'-'+timeStr;
const infolog = util.log;
const debuglog = util.debuglog(baseName);

// 初期処理
debuglog(`${scriptName} START`);

// 引数解析
var help = process.argv.length <= 2 || process.argv[2] == '-h';
if (help) {
  console.log('Usage: node ' + scriptName);
  return;
}

// 主処理
// ▼▼▼ここに処理を書きます
console.log("カレントディレクトリ：" + process.cwd());
for (var i = 0; i < process.argv.length; i++) {
  console.log('argv ' + i + ": " + process.argv[i]);
}
// ▲▲▲ここに処理を書きます

// 終了処理
debuglog(`${scriptName} END`);
