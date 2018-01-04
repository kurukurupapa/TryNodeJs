// Yahoo!JAPAN 日本語形態素解析 を使ってみる。
//
// 実行例
// node yahoo-maservice-01.js トマトが嫌いだけど、トマトジュースを飲む。
//
// デバッグログ
// set NODE_DEBUG=myapp
//
// 参考
// テキスト解析:日本語形態素解析 - Yahoo!デベロッパーネットワーク
// http://developer.yahoo.co.jp/webapi/jlp/ma/v1/parse.html
//
// 2016/02/14 新規作成

var URL = "http://jlp.yahooapis.jp/MAService/V1/parse";
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
    "results": "ma,uniq", //形態素解析、出現頻度
  },
  function(err, $, res, body){
    if (err) {
      console.error("ERROR");
      console.error(err);
      return;
    }

    debuglog(body.replace(/></g, ">" + os.EOL + "<"));

    console.log("形態素解析結果");
    $("ma_result word").each(function(i){
      var surface = $(this).children("surface").text();
      var reading = $(this).children("reading").text();
      var pos = $(this).children("pos").text();
      console.info(pos + "," + surface + "（" + reading + "）");
    });

    console.log("\n出現頻度結果");
    $("uniq_result word").each(function(i){
      var surface = $(this).children("surface").text();
      var count = $(this).children("count").text();
      console.info(count + "," + surface);
    });
  }
);
