// Yahoo!JAPAN キーフレーズ抽出 を使ってみる。
//
// 実行例
// node yahoo-keyphrase-01.js トマトが嫌いだけど、トマトジュースを飲む。
//
// デバッグログ
// set NODE_DEBUG=myapp
//
// 参考
// テキスト解析:キーフレーズ抽出 - Yahoo!デベロッパーネットワーク
// http://developer.yahoo.co.jp/webapi/jlp/keyphrase/v1/extract.html
//
// 2016/02/14 新規作成

var URL = "http://jlp.yahooapis.jp/KeyphraseService/V1/extract";
var APP_ID = process.env.YAHOO_APP_ID;

var debuglog = require("util").debuglog("myapp");
var basename = __filename.replace(/^.+[\/\\]/, "");

if (process.argv.length <= 2) {
  console.info("Usage: node " + basename + " テキスト");
  return;
}
var text = process.argv[2];

var client = require("cheerio-httpcli");
var os = require("os");
client.fetch(URL, {
    "appid": APP_ID,
    "sentence": text,
    "output":
      "xml",
      // "json",
  },
  function(err, $, res, body){
    if (err) {
      console.error("ERROR");
      console.error(err);
      return;
    }

    console.log(body);
  }
);
