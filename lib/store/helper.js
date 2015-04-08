'use strict';

var unorm = require('unorm');

module.exports.getCode = function *(name) {
 try {
    var item_code = (unorm.nfkd(name + Math.floor(Math.random()*100)).replace(/[\u0300-\u036F]/g, "")).replace(/[^A-Z0-9]+/ig, "-");
    return item_code.toLowerCase();
  } catch(err) {
    console.log("err" + err);
    throw err;
  }
};