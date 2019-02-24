// cheerio-httpcliを使ってみる。
// ローカルのJenkinsにログインしてみる。

// cheerio-httpcliのバージョン: 0.6.4

// Node.jsのスクレイピングモジュール「cheerio-httpcli」が第3形態に進化したようです - Qiita
// http://qiita.com/ktty1220/items/72109a6419e23a26002c

// Node.jsのスクレイピングモジュール「cheerio-httpcli」が大規模アップデートして帰ってきた - Qiita
// http://qiita.com/ktty1220/items/64168e8d416d6d8ffb45

// 2016/02/06 新規作成

var client = require("cheerio-httpcli");

console.log("START");

// User-Agent設定
//client.setBrowser("chrome");
// client.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.131 Safari/537.36';

client.fetch("http://localhost:8180/")
.then(function(result){
  // TOP画面
  var $ = result.$;
  console.log("Title:", $("title").text());
  if ($("title").text() != "Categorized Jobs View [Jenkins]") {
    throw result;
  }
  return $("div.login a").click();
})
.then(function(result){
  // ログイン画面
  var $ = result.$;
  console.log("Title:", $("title").text());
  if ($("title").text() != "Jenkins") {
    throw result;
  }
  $("input[name=j_username]").val("hiro");
  $("input[name=j_password]").val("hiro");
  //return $("#yui-gen1-button").click();
  return $("input[name=Submit]").click();
})
.then(function(result){
  // ログイン後の画面
  var $ = result.$;
  console.log("Title:", $("title").text());
  if ($("title").text() != "Categorized Jobs View [Jenkins]") {
    throw result;
  }
  var username = $("div.login a:first-child b").text();
  console.log("Username:", username);
  console.log("ok!");
})
.catch(function(err){
  console.log("ERROR");
  console.log(err);
})
.finally(function(){
  console.log("END");
});
