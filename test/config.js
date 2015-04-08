// Include this into every mocha run!
// console.log("Setting test environent variables..");
// process.env['LZ_API_SERVER_MONGODB_URL'] = 'mongodb://localhost:27017';
// process.env['LZ_API_SERVER_PORT'] = 9070;
// process.env['LZ_API_SERVER_DEFAULT_CLUSTER'] = 'deva';

//var passport = require('koa-passport')
  var co = require('co')
   , mongoose = require('mongoose')
   , config = require('../config.js')
   , userDB = require("../lib/user/user_schema.js")
   // , UserAdminAPI = require('../lib/user/user_admin.js')
   // , indexGlobalAPI = require('./web_api/v1/index_global.js')
   , Promise = require('bluebird')


// var Promise = require('bluebird');
// var userDB = require("./user_schema.js");
// var roleDB = require("./role_schema.js");
// var bcrypt = require('bcrypt-nodejs');
// var EmailHelper = require('./email_helper');
// // var Helper = require('../appHelper');
// var config = require('../../config');
// var ofs = require('fs');
// var path = require('path');
// var promisePipe = require("promisepipe");

/*
NODE_ENV=test
LZ_API_ASSET_SERVER_CDN_URL=http://localhost:9070/api/v1/
LZ_API_ASSET_SERVER_FILEDBPATH=/var/tmp
LZ_API_SERVER_PORT=9070
LZ_API_SERVER_BASEPATH=api
LZ_API_SERVER_EXTURL=http://localhost:9070/api/v1/
LZ_API_SERVER_TMPDIR": "/var/tmp",
LZ_API_SERVER_MONGODB_URL": "mongodb://localhost:27017/lz-dev"
LZ_API_SERVER_CURR_CLUSTER=test
LZ_API_SERVER_MONGODB_URL=mongodb://localhost:27017/lz-test
LZ_API_RESQUE_HOST=127.0.0.1,
LZ_API_RESQUE_PW=,
LZ_API_RESQUE_PORT=6379,
LZ_API_RESQUE_DB=0,
LZ_API_RESQUE_NS=resque-test
LZ_API_LEIKI_SSB=stories-test1
LZ_API_LEIKI_TSB=topics-test1
*/

before(function*(){
  // give some time to APIs wake up
  console.log("before test user..");
  yield Promise.delay(1500);
})

after(function*(){
  console.log("Dropping test user..");
 //console.log("Dropping test database..");
 // TODO: drop test datase from mongo
})
