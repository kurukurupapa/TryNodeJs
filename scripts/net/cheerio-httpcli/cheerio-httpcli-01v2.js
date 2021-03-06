// cheerio-httpcliを使ってみる。
// cheerio-httpcliのバージョン: 0.6.4

// Node.jsのスクレイピングモジュール「cheerio-httpcli」が第3形態に進化したようです - Qiita
// http://qiita.com/ktty1220/items/72109a6419e23a26002c

// 2016/02/06 新規作成

var client = require('cheerio-httpcli');

// Googleで「node.js」について検索する。
client.fetch('http://www.google.com/search',
  { q: 'node.js' },
  function (err, $, res) {
    if (err) throw err;
    
    // レスポンスヘッダを参照
    console.log(res.headers);

    // HTMLタイトルを表示
    console.log($('title').text());

    // リンク一覧を表示
    $('a').each(function (idx) {
        console.log($(this).text() + ' ' + $(this).attr('href'));
    });
  }
);
