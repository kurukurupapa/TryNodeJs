# 今日から始めるCoffeeScript - KAYAC engineers' blog
# http://techblog.kayac.com/coffeescript-tutorial.html

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

dog = new Dog("Bob")
dog.say("Hello!")
