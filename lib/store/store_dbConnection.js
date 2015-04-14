var mongoose = require('mongoose');
var config = require('../../config');
var db = mongoose.createConnection(config.mongo.url+'/productStore');
module.exports.db=db;
