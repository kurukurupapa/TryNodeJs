// cheerioを使ってみる。


// 動作確認環境
// Node.js 4.2.6
// cheerio 0.20.0

// 2016/02/20 新規作成

var html = ""
  + "<html>"
  + "<body>"
  + "<h1>タイトル</h1>"
  + "</body>"
  + "</html>"
  ;

var cheerio = require("cheerio");
$ = require("cheerio").load(html);
console.log($.html());
console.log($("h1").text());
