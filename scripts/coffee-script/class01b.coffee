# 今日から始めるCoffeeScript - KAYAC engineers' blog
# http://techblog.kayac.com/coffeescript-tutorial.html

util = require 'util'

class Animal
    # newした時に呼ばれるコンストラクタ
    constructor: (name) ->
        @name = name
    say: (word) ->
        console.log "#{@name} said: #{word}"

class Dog extends Animal
    constructor: (name) ->
        # 親クラスのコンストラクタを呼ぶ
        super name
    say: (word) ->
        # 親クラスのメソッドを呼ぶ
        super "Bowwow, #{word}"

class Dog2 extends Animal
    # 定数定義の記述方法はない？→英大文字で書くことで何となく定数っぽくする。
    @CLASS_STATIC_PROPERTY1 = 'クラス定数1'
    @CLASS_STATIC_PROPERTY2:  'クラス定数2'
    @class_property1 = 'クラス変数1'
    @class_property2:  'クラス変数2'
    INSTANCE_STATIC_PROPERTY1 = 'インスタンス定数1' #定義できない。undefinedになる。
    INSTANCE_STATIC_PROPERTY2:  'インスタンス定数2'
    instance_property1 = 'インスタンス変数1' #定義できない。undefinedになる。
    instance_property2:  'インスタンス変数2'

    constructor: (name, @instance_property3) ->
        super name
        @instance_property4 = 'インスタンス変数4'

    say2: (word) ->
        @say "Bowwow, #{word}"

dog = new Dog("Bob")
dog.say("Hello!")

dog2obj = new Dog2("Bob2")
dog2obj.say2("Hello!")
console.log "dog2obj=#{util.inspect dog2obj}"
console.log "Dog2=#{util.inspect Dog2}"

console.log ""
console.log "dog2obj=#{util.inspect dog2obj}"
console.log "dog2obj.instance_property1=#{dog2obj.instance_property1}"
console.log "dog2obj.instance_property2=#{dog2obj.instance_property2}"
dog2obj.instance_property1 = 'インスタンス変数1b'
dog2obj.instance_property2 = 'インスタンス変数2b'
console.log "dog2obj=#{util.inspect dog2obj}"
console.log "dog2obj.instance_property1=#{dog2obj.instance_property1}"
console.log "dog2obj.instance_property2=#{dog2obj.instance_property2}"

console.log ""
console.log "Dog2=#{util.inspect Dog2}"
console.log "Dog2.class_property1=#{Dog2.class_property1}"
console.log "Dog2.class_property2=#{Dog2.class_property2}"
Dog2.class_property1 = 'クラス変数1b'
Dog2.class_property2 = 'クラス変数2b'
console.log "Dog2=#{util.inspect Dog2}"
console.log "Dog2.class_property1=#{Dog2.class_property1}"
console.log "Dog2.class_property2=#{Dog2.class_property2}"
