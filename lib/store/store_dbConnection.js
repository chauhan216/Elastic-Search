var mongoose = require('mongoose');
var config = require('../../config');
var db = mongoose.createConnection(config.mongo.url+'/elasticSearchTest');
module.exports.db=db;
