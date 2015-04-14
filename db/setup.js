'use strict';
try {
  var argv = require('yargs').argv
    , fs = require('fs')
    , promisePipe = require('promisepipe')
    , Promise = require('bluebird')
    , path = require('path')
    , file = require('file')
    , co = require('co')
    , unorm = require('unorm')
    , StreamReader = require('co-read')
 
} catch(e) {
  console.error(e.message);
  console.error("Try installing it by `npm install <module>`.");
  process.exit(e.code);
}

//
// Init
//

if (argv._.length !== 1) {
  console.log("\nCommands:");
  console.log("db:init (Creates database & sets application data)");
  console.log("db:init:products (Sets products only)");
  console.log("db:init:stores (Sets stores only)");
  process.exit(1);
}

var command = argv._[0];
var seed_dir;

if (!argv.seed_dir) {
  seed_dir = './data'
  console.log("no --seed_dir parameter; defaulting to `" + seed_dir + "`");
} else {
  seed_dir = argv.seed_dir
  console.log("Seed dir set to `" + seed_dir + "`");
}

if (!argv.env) {
  console.log("no --env parameter; using system defaults");
} else {
  var env = require(argv.env).env;
  for (var prop in env) {
    console.log("Setting " + prop + "=" + env[prop]);
    process.env[prop] = env[prop];
  }
}

//
// Kick system up
//
var config = require("../config.js");
var productDb = require("../lib/store/store_product_schema.js");
var storeDb = require("../lib/store/store_schema.js");
var categoryDb = require("../lib/store/category_schema.js");
var reviewDb = require("../lib/store/product_reviews_schema.js");
var ElasticSearch = require("elasticsearch");
// Routines
//

function *processProducts(seed_data) {
  for (var i = 0; i < seed_data.length; i++) {
    var product = seed_data[i];
    if(old_cat_code[product.category_code])
      for(var j = 0; j < product.category_code.length; j++){
        product.category_code[j] = old_cat_code[product.category_code[j]]
    }
    else
      product.category_code = null;

    try {
      product.product_code = (unorm.nfkd(product.name + Math.floor(Math.random()*100)).replace(/[\u0300-\u036F]/g, "")).replace(/[^A-Z0-9]+/ig, "-");
      yield productDb.productCollection.findOneAndUpdate(
        {product_id: product.product_id},product,
        {upsert: true }
      ).exec();
    }catch(err){
        console.log ("error"+err);
        throw(err)
    }
  }
    console.log("seed completed for products");
}

function *setproducts() {
  var product_dir = path.join(seed_dir, "product");
  // check files in seed directory
  console.log("Looking product seed file from `" + product_dir + "`");
  try {
    var files = fs.readdirSync(product_dir);
  }
  catch(e) {
    console.error("Couldn't read directory " + product_dir);
    process.exit(e.code);
  }
  // process file by file
  for (var i = 0; i < files.length; i++) {
    var filename = files[i];
    console.log("Checking `" + filename + "`...");
    var full_path_filename = product_dir + '/' + filename;

    var stat = yield Promise.promisify(fs.stat, fs)(full_path_filename).catch (function(err) {
      console.warn('bad file!');
      throw {
        name: 'Bad seed file',
        value: err
      }
    });

    if (!stat.isFile() || filename.split('.').pop() !== 'json') throw {
      name: 'Bad seed file',
      value: filename
    }
    var seed_data = JSON.parse(fs.readFileSync(full_path_filename));
    // iterate objects in seed data
    yield processProducts(seed_data);
  }
}

function *processStores(seed_data) {
  for (var i = 0; i < seed_data.length; i++) {
    var store = seed_data[i];
    try {
      store.store_code = (unorm.nfkd(store.name + Math.floor(Math.random()*100)).replace(/[\u0300-\u036F]/g, "")).replace(/[^A-Z0-9]+/ig, "-");
      yield storeDb.storeCollection.findOneAndUpdate(
        {store_id: store.store_id},store,
        {upsert: true }
      ).exec();
    }catch(err){
        console.log ("error"+err);
        throw(err)
    }
  }
    console.log("seed completed for stores");
}

function *setStores() {
  var store_dir = path.join(seed_dir, "store");
  // check files in seed directory
  console.log("Looking store seed file from `" + store_dir + "`");
  try {
    var files = fs.readdirSync(store_dir);
  }
  catch(e) {
    console.error("Couldn't read directory " + store_dir);
    process.exit(e.code);
  }
  // process file by file
  for (var i = 0; i < files.length; i++) {
    var filename = files[i];
    console.log("Checking `" + filename + "`...");
    var full_path_filename = store_dir + '/' + filename;

    var stat = yield Promise.promisify(fs.stat, fs)(full_path_filename).catch (function(err) {
      console.warn('bad file!');
      throw {
        name: 'Bad seed file',
        value: err
      }
    });

    if (!stat.isFile() || filename.split('.').pop() !== 'json') throw {
      name: 'Bad seed file',
      value: filename
    }
    var seed_data = JSON.parse(fs.readFileSync(full_path_filename));
    // iterate objects in seed data
    yield processStores(seed_data);
  }
}

var old_cat_code = {};
function *processCategory(seed_data) {
  
  for (var i = 0; i < seed_data.length; i++) {
    var category = seed_data[i];
    try {
      var category_code = (unorm.nfkd(category.name + Math.floor(Math.random()*100)).replace(/[\u0300-\u036F]/g, "")).replace(/[^A-Z0-9]+/ig, "-");
      old_cat_code[category.category_code] = category_code;
      category.category_code = category_code;
      if (!category.parent_category) {
        category.parent_category = "";
      }
        var category = yield categoryDb.categoryCollection.findOneAndUpdate(
        {name: category.name},category,
        {upsert: true }
        ).exec();
      // }
      // else {
      //   category.parent_category = old_cat_code[category.parent_category];
      //   var category = yield categoryDb.categoryCollection.findOneAndUpdate(
      //     {name: category.name},category,
      //     {upsert: true }
      //     ).exec();
      // }
    }catch(err){
        console.log ("error"+err);
        throw(err)
    }
  }
    console.log("seed completed for category");
}

function *setCategories() {
  var category_dir = path.join(seed_dir, "category");
  // check files in seed directory
  console.log("Looking category seed file from `" + category_dir + "`");
  try {
    var files = fs.readdirSync(category_dir);
  }
  catch(e) {
    console.error("Couldn't read directory " + category_dir);
    process.exit(e.code);
  }
  // process file by file
  for (var i = 0; i < files.length; i++) {
    var filename = files[i];
    console.log("Checking `" + filename + "`...");
    var full_path_filename = category_dir + '/' + filename;

    var stat = yield Promise.promisify(fs.stat, fs)(full_path_filename).catch (function(err) {
      console.warn('bad file!');
      throw {
        name: 'Bad seed file',
        value: err
      }
    });

    if (!stat.isFile() || filename.split('.').pop() !== 'json') throw {
      name: 'Bad seed file',
      value: filename
    }
    var seed_data = JSON.parse(fs.readFileSync(full_path_filename));
    // iterate objects in seed data
    yield processCategory(seed_data);
  }
}

function *processReviews(seed_data) {
  for (var i = 0; i < seed_data.length; i++) {
    var review = seed_data[i];
    try {
      yield reviewDb.reviewCollection.findOneAndUpdate(
        {user_id: review.creator_id},review,
        {upsert: true }
      ).exec();
    } catch(err){
        console.log ("error"+err);
        throw(err)
    }
  }
    console.log("seed completed for reviews");
}

function *setReviews() {
  var review_dir = path.join(seed_dir, "review");
  // check files in seed directory
  console.log("Looking review seed file from `" + review_dir + "`");
  try {
    var files = fs.readdirSync(review_dir);
  }
  catch(e) {
    console.error("Couldn't read directory " + review_dir);
    process.exit(e.code);
  }
  // process file by file
  for (var i = 0; i < files.length; i++) {
    var filename = files[i];
    console.log("Checking `" + filename + "`...");
    var full_path_filename = review_dir + '/' + filename;

    var stat = yield Promise.promisify(fs.stat, fs)(full_path_filename).catch (function(err) {
      console.warn('bad file!');
      throw {
        name: 'Bad seed file',
        value: err
      }
    });

    if (!stat.isFile() || filename.split('.').pop() !== 'json') throw {
      name: 'Bad seed file',
      value: filename
    }
    var seed_data = JSON.parse(fs.readFileSync(full_path_filename));
    // iterate objects in seed data
    yield processReviews(seed_data);
  }
}


function *indexElasticSearchProducts() {
 var doc,
  stream = productDb.productCollection.find({}, { strict: false }).stream();
  var es = new ElasticSearch.Client({
      host: config.elastic.url
    });

  while (doc = yield StreamReader(stream)) {
    doc = doc.toObject();
    console.log ("doc product_id:" + doc.product_code);
    yield es.index({
        consistency: 'one',
        index: config.elastic.productIndexName,
        type: config.elastic.productIndexName,
        id: doc.product_code,
        requestTimeout: 1000,
        body: {
         "product_code":doc.product_code,
         "name":doc.name,
         "description":doc.description,
         // "category":doc.description,
         // "subcategory":doc.subcategory,
         // "deliveryspecs":"US addresses only",
         // "shippingspecs":"$7.00 flat-rate per order",
         // "returnsspecs":"Please email hello@eppiko.com to request for the Return Number prior to mailing back your item(s)."
        }
      }).then(function (response) {
        console.log("Indexed: ", response);
      }, function (error) {
        console.log("Index failed: ", error.message);
    });
  }
}

//
// Main
//

co(function *(){

  //give some time to APIs wake up
  yield Promise.delay(3000);

  switch ( command ) {

  case 'db:clear':
    break;
  case 'db:init':
    console.log("Initializing database...");
    // yield setStores();
    yield setCategories();
    yield setproducts();
    yield setReviews(); 
    break;
  case 'db:init:products':
    console.log("Initializing database (products only)...");
    yield setproducts();
    break;
  case 'db:init:stores':
    console.log("Initializing database (stores only)...");
    yield setStores();
    break;
  case 'db:init:categories':
    console.log("Initializing database (categories only)...");
    yield setCategories();
    break;
  case 'db:init:reviews':
    console.log("Initializing database (reviews only)...");
    yield setReviews();
    break;
  case 'elastic:seed':
    console.log("Running migrate elastic reIndex actions");
    yield indexElasticSearchProducts();
    break;    
  default:
    console.log("Unknown command (" + command + ")");
    process.exit(1);
  }

  process.exit(0);
})()



