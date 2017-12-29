// モジュールを自作してみる。

// 2016/02/19 新規作成

console.log("START");

var myModuleB = require("./modules02b.js");
console.log(myModuleB);
console.log(module.exports);
myModuleB.run();

var myModuleC = require("./modules02c.js");
console.log(myModuleC);
console.log(module.exports);
myModuleC.run();

console.log("END");
