# https://qiita.com/mrpepper/items/e9643bdcc8f127fdacba

myclass = ->
  class myclass
    _privatevar = 'private'
    @staticvar: 'static'

    constructor: ->
      @instanceproperty = 'test'

    @outstatic: ->
      console.log @staticvar
    outprivate: ->
      console.log _privatevar
    outproperty: ->
      console.log @instanceproperty

module.exports.myclass = myclass

my2ndclass = ->
  class my2ndclass
    @utility: ->
      console.log 'thanks for using'
    @util2: ->
      console.log 'a ri ga to u!'

module.exports.my2ndclass = my2ndclass

# 次のようにmodule.exportsとクラス定義をまとめて書くこともできる。
module.exports.ClassA =
  class ClassA
    constructor: (name) ->
      @name = name
      console.log "constructor: #{@name}"
    say: (word) ->
      console.log "#{@name} said: #{word}"

class ClassB
  constructor: (name) ->
    @name = name
    console.log "constructor: #{@name}"
  say: (word) ->
    console.log "#{@name} said: #{word}"
module.exports.ClassB = ClassB
