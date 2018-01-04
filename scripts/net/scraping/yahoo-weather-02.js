// Yahoo!JAPAN天気・災害ピンポイント天気を使ってみる。
//
// デバッグログ
// set NODE_DEBUG=myapp
//
// 参考
// cheerio-httpcli
// https://www.npmjs.com/package/cheerio-httpcli
//
// 2016/02/14 新規作成

var debuglog = require("util").debuglog("myapp");

// xx県xx市xx区の天気 - Yahoo!天気・災害
// var url = "http://weather.yahoo.co.jp/weather/jp/xx/xxxx/xxxxx.html";
var url = process.env.YAHOO_WEATHER_URL;

var client = require('cheerio-httpcli');

client.fetch(url, function(err, $, res, body){
  if (err) {
    console.error("ERROR");
    console.error(err);
    return;
  }

  // 現在位置
  var location = trim($("#cat-pass").text());
  console.info(location);

  // ピンポイント天気（今日）
  var ids = ["#yjw_pinpoint_today", "#yjw_pinpoint_tomorrow"];
  for (var idIndex = 0; idIndex < ids.length; idIndex++) {
    var title = $(ids[idIndex] + " h3").text();
    console.info(trim(title));
    var table = [];
    $("#yjw_pinpoint_today table tr").each(function(i){
      var columns = [];
      $(this).children("td").each(function(j){
        var text = trim($(this).text());
        debuglog(i + "," + j + "," + text);
        columns.push(text);
      });
      table.push(columns);
    });
    for (var i = 0; i < table[0].length - 1; i++) {
      console.info(table[0][i+1] + " " + table[1][i+1] + " " + table[2][i+1] + "℃");
    }
  }
});

function trim(str) {
  return str
    .replace(/^[ \t\r\n]+/, "")
    .replace(/[ \t\r\n]+$/, "")
    .replace(/[ \t\r\n]+/g, " ");
}
