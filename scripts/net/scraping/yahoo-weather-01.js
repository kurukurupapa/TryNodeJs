// Yahoo!JAPAN天気・災害RSSを使ってみる。
//
// デバッグログ
// set NODE_DEBUG=myapp
//
// 提供RSS - Yahoo!天気・災害
// http://weather.yahoo.co.jp/weather/rss/
//
// cheerio-httpcli
// https://www.npmjs.com/package/cheerio-httpcli
//
// 2016/02/14 新規作成

var debuglog = require("util").debuglog("myapp");

// xx県xx市
// var url = 'http://rss.weather.yahoo.co.jp/rss/days/xxxx.xml';
var url = process.env.YAHOO_WEATHER_RSS;

var client = require('cheerio-httpcli');

client.fetch(url, function(err, $, res, body){
  if (err) {
    console.error("ERROR");
    console.error(err);
    return;
  }
  debuglog("-----");
  debuglog($.html());
  debuglog("-----");
  debuglog(body);

  var title = $("channel > title").text();
  console.info(title);

  $("item").each(function(i){
    var title = $(this).children("title").text().replace(/ - Yahoo!天気・災害/, "");
    console.info(title);
  });
});
