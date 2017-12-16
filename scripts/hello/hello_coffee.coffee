# はじめてのCoffeeScript
#
# 参考
# 今日から始めるCoffeeScript - KAYAC engineers' blog http://techblog.kayac.com/coffeescript-tutorial.html
#
# 事前準備
# $ npm install coffee-script
#
# スクリプト実行
# coffee -c scripts/hello/hello_coffee.coffee
# node scripts/hello/hello_coffee.js
# OR
# coffee scripts/hello/hello_coffee.coffee

hello = ->
  console.log("Hello World!")

hello()
