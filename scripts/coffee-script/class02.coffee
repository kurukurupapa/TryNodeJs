# https://qiita.com/mrpepper/items/e9643bdcc8f127fdacba

# subfile = require('./class02sub.coffee')
subfile = require('./class02sub') #拡張子coffeeは無くてもよい。

myclassinstance = new(subfile.myclass())

console.log '---outstatic'
subfile.myclass().outstatic()
console.log '---outprivate'
myclassinstance.outprivate()
console.log '---outproperty'
myclassinstance.outproperty()

my2ndclass = subfile.my2ndclass()

console.log '---utility'
my2ndclass.utility()
console.log '---util2'
my2ndclass.util2()

console.log '---'
objA = new subfile.ClassA 'NameA'
objA.say 'Hello!'

objB = new subfile.ClassB 'NameB'
objB.say 'Hello!'
