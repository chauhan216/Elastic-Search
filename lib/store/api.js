'use strict';
var Promise = require('bluebird');
var productDb = require("./store_product_schema.js");
var storeDb = require("./store_schema.js");
var categoryDb = require("./category_schema.js");
var reviewDb = require("./product_reviews_schema.js");
var AppHelper = require('./helper.js');
var ElasticAPI = require('./elastic_api');
/**
 * Add new review
 *
 * @param opts {object} TBD
 * @return {review} TBD
 * @throws {exceptions} TBD
 */



module.exports.addNewReview = function *(opts) {
  //this function will add a new review in database
  console.log("API addNewReview  START");
  opts.creationtimestamp = new Date();
  var review = new reviewDb.reviewCollection(opts);
  try {
    var saved_data = yield Promise.promisify(review.save,review);
    console.log("API addNewReview saved_data:" + JSON.stringify(saved_data));
    return saved_data;
  } catch(err) {
    console.log("err" + err);
    throw err;
  }
};

/**
 * Get reviews
 *
 * @param opts {object} TBD
 * @return {reviews} TBD
 * @throws {exceptions} TBD
 */

module.exports.getReviews = function *(opts) {
  //this function will list all reviews of a product
  console.log("API getReviews START ");
  try {
    var reviews = yield reviewDb.reviewCollection.find({"product_id":opts.product_id}).exec();
    if(!reviews){
      throw new Error("no review found");
    }

  console.log("reviews found"+JSON.stringify(reviews));

    return reviews;
  } catch(err) {
    throw err;  
  }
   
 };

/**
 * will update existing review
 *
 * @param opts {object} TBD
 * @return {review} TBD
 * @throws {exceptions} TBD
 */
  
module.exports.updateReview = function *(opts) {
  //this function will update the existing review from database on the basis of creator_id
  console.log("API updateReview START ");
  try {
    var review = yield reviewDb.reviewCollection.findOne({"creator_id":opts.creator_id}).exec();
    if(!review){
      throw new Error("creator not found");
    }
    review.score = opts.body["score"];
    review.recommend = opts.body["recommend"];
    review.review_text = opts.body["review_text"];
    review.useful_votes = opts.body["useful_votes"];
    
    var saved_data = yield Promise.promisify(review.save,review)();
    return saved_data;  
  } catch(err) {
    console.log("err" + err);
    throw err;
  }  
};

/**
 * will delete existing review
 *
 * @param opts {object} TBD
 * @return {review} TBD
 * @throws {exceptions} TBD
 */

module.exports.deleteReview = function *(opts) {
  //this function will delete the existing category from the database
  console.log("API deleteReview START ");
  try {
    var reviewDelete = yield reviewDb.reviewCollection.findOne({"creator_id":opts.creator_id}).exec();
    if(!reviewDelete){
      throw new Error("creater is invalid");
    }
    yield reviewDb.reviewCollection.remove({"creator_id":opts.creator_id}).exec();
    return reviewDelete; 
  } catch(err) {
    console.log("err" + err);
    throw err;
  }  
};



/**
 * Add new category
 *
 * @param opts {object} TBD
 * @return {category} TBD
 * @throws {exceptions} TBD
 */

module.exports.addNewCategory = function *(opts) {
  //this function will create a new category in database
  console.log("API addNewCategory  START");
  var category = new categoryDb.categoryCollection(opts);
  if(!category.parent_category){
    category.parent_category = "";
  }
  category["attributes"] = [];
  category.category_code = yield AppHelper.getCode(category.name);
  try {
    var saved_data = yield Promise.promisify(category.save,category);

    console.log("API addNewCategory saved_data:" + JSON.stringify(saved_data));
    yield ElasticAPI.addCategoryInElastic(saved_data[0]);
    return saved_data;
  } catch(err) {
    console.log("err" + err);
    throw err;
  }
};

/**
 * Get categories
 *
 * @param opts {object} TBD
 * @return {categories} TBD
 * @throws {exceptions} TBD
 */

module.exports.getCategories = function *() {
  //this function will list all parent category
  console.log("API getCategories START ");
  try {
    var categories = yield categoryDb.categoryCollection.find({"parent_category": ""}).exec();
    if(!categories){
      throw new Error("no category found");
    }

  console.log("category found"+JSON.stringify(categories));

    return categories;
  } catch(err) {
    throw err;  
  }
   
 };


/**
 * Get subcategoires for category
 *
 * @param opts {object} TBD
 * @return {categories} TBD
 * @throws {exceptions} TBD
 */

module.exports.getSubCategories = function *(opts) {
  //this function will list all  subcategoires for category
  console.log("API getChildCategories START ",opts);
  try {
    var parentCategory = yield categoryDb.categoryCollection.findOne({"category_code":opts.category_code}).exec();
    console.log("parentCategory"+parentCategory.name);
    if ( !parentCategory ) {
      throw new Error("parentCategory  is invalid");
    }
    } catch(err) {
    throw err;  
  }
  try {
    var categories = yield categoryDb.categoryCollection.find({"parent_category":parentCategory.name.replace(/\s+/g, "")}).exec();
    console.log("...subcategoires are :",categories);
    if(!categories){
      throw new Error("subcategoires not found");
    }
    return categories;
  } catch(err) {
    throw err;  
  }
   
  }

 /**
 * will update existing category
 *
 * @param opts {object} TBD
 * @return {category} TBD
 * @throws {exceptions} TBD
 */
  
module.exports.updateCategory = function *(opts) {
  //this function will updateCategory the existing category from database on the basis of category_name
  console.log("API updateCategory START ");
  try {
    
    if (!opts.category_code) {
      throw new Error("category_code field is mandatory");
    }

    var category = yield categoryDb.categoryCollection.findOne({"category_code":opts.category_code}).exec();
    if(!category){
      throw new Error("category  is invalid");
    }

    if (opts.body["name"]) {
      var cat_code = yield AppHelper.getCode(opts.body["name"]);
      yield categoryDb.categoryCollection.update({"parent_category":opts.category_code},
                       {"$set":{"parent_category":cat_code}},{"multi":true}).exec();
      category.category_code = cat_code;
      category.name = opts.body["name"];
    }
    
    if(opts.body["parent_category"]){
      category.parent_category = opts.body["parent_category"];
    }

    var saved_data = yield Promise.promisify(category.save,category)();
    return saved_data;  
  } catch(err) {
    console.log("err" + err.stack);
    throw err;
  }  
};

/**
 * will delete existing category
 *
 * @param opts {object} TBD
 * @return {category} TBD
 * @throws {exceptions} TBD
 */

module.exports.deleteCategory = function *(opts) {
  //this function will delete the existing category from the database
  console.log("API deleteCategory START ");
  try {
    var categoryDelete = yield categoryDb.categoryCollection.findOne({"category_code":opts.category_code}).exec();
    if(!categoryDelete){
      throw new Error("category  is invalid");
    }
    yield categoryDb.categoryCollection.remove({"category_code":opts.category_code}).exec();
    return categoryDelete; 
  } catch(err) {
    console.log("err" + err);
    throw err;
  }  
};


/**
 * Get a single product
 *
 * @param opts {object} TBD
 * @return {product} TBD
 * @throws {exceptions} TBD
 */

module.exports.getProduct = function *(opts) {
  //this function will list all the  Store from database on the count of 10
  console.log("API getProduct START ");
  try {
    var product = yield productDb.productCollection.find({"product_code":opts.product_code}).exec();
    if(!product){
      throw new Error("product_code  is invalid");
    }
    return product;
  } catch(err) {
    throw err;  
  }
   
 };
/**
 * Get  products
 *
 * @param opts {object} TBD
 * @return {products} TBD
 * @throws {exceptions} TBD
 */

module.exports.getProductsForCategory = function *(opts) {
  //this function will list all the  products from database on the basis of category_code
  console.log("API getProductsForCategory START");
  try {
    var categories = yield categoryDb.categoryCollection.find({"parent_category":opts.category_code}).exec();
    var inArray = [];
    inArray[0] = opts.category_code;
    for ( var i = 0; i<categories.length; i++){
       inArray[i+1] = categories[i].category_code; 
    } 
    var query = {"category_code":{ '$in': inArray }};
    var products = yield productDb.productCollection.find(query).exec();
    if(!products){
      throw new Error("No products found for this category");
    }
    return products;
  } catch(err) {
    throw err;  
  }
   
 };


/**
 * Add new product
 *
 * @param opts {object} TBD
 * @return {product} TBD
 * @throws {exceptions} TBD
 */

module.exports.addNewProduct = function *(opts) {
  //this function will create a new product in databas
  
  console.log("API addNewProduct  START",opts);
  var product = new productDb.productCollection(opts);
  try {
    product.product_code = yield AppHelper.getCode(product.name);
    var savedData = yield Promise.promisify(product.save,product);
    yield ElasticAPI.addProductInElastic(savedData[0]);
    yield updateCategoryAttribute(savedData[0]);
    return savedData;
  } catch(err) {
    console.log("err" + err);
    throw err;
  }
};



/**
 * Get all product
 *
 * @param opts {object} TBD
 * @return {product} TBD
 * @throws {exceptions} TBD
 */

module.exports.getAllProduct = function *(opts) {
  //this function will list all the  product from database on the count of 10
  console.log("API List START ");
  try {
    var products = yield productDb.productCollection.find({}).limit(opts.limit).skip(opts.skip).exec();
    return products;
  } catch(err) {
    console.log("err" + err);
    throw err;  
  }
   
};

/**
 * will update existing product
 *
 * @param opts {object} TBD
 * @return {product} TBD
 * @throws {exceptions} TBD
 */
  
module.exports.updateProduct = function *(opts) {
  //this function will updateProduct the existing product from database on the basis of product_id
  console.log("API updateProduct START ");
  try {
    var product = yield productDb.productCollection.findOne({"product_id":opts.id}).exec();
    if(!product){
      throw new Error("product_id  is invalid");
    }

    if (opts.body["name"]) {
      product.product_code = yield AppHelper.getCode(opts.body["name"]);
      product.name = opts.body["name"];
    }

    product.category = opts.body["category"];
    var saved_data = yield Promise.promisify(product.save,product)();
    return saved_data;  
  } catch(err) {
    console.log("err" + err);
    throw err;
  }  
};

/**
 * will delete existing product
 *
 * @param opts {object} TBD
 * @return {product} TBD
 * @throws {exceptions} TBD
 */

module.exports.productDelete = function *(opts) {
  //this function will delete the existing product from the database
  console.log("API productDelete START ");
  try {
    var productDelete = yield productDb.productCollection.findOne({"product_id":opts.id}).exec();
    if(!productDelete){
      throw new Error("product_id  is invalid");
    }
    yield productDb.productCollection.remove({"product_id":opts.id}).exec();
    yield ElasticAPI.deleteProductIndex(productDelete);
    return productDelete; 
  } catch(err) {
    console.log("err" + err);
    throw err;
  }  
};

/**
 * Add new store
 *
 * @param opts {object} TBD
 * @return {store} TBD
 * @throws {exceptions} TBD
 */

module.exports.addNewStore = function *(opts) {
  //this function will create a new store in database
  console.log("API addNewStore  START");
  opts.creationtimestamp = new Date();
  var store = new storeDb.storeCollection(opts);
  try {
    console.log("API addNewStore  START 2");
    store.store_code = yield AppHelper.getCode(store.name);
    var saved_data = yield Promise.promisify(store.save,store);
    console.log("API addNewStore  START 3");
    console.log("API addNewStore saved_data:" + JSON.stringify(saved_data));
    return saved_data;
  } catch(err) {
    console.log("err" + err);
    throw err;
  }
};

/**
 * Get  Store
 *
 * @param opts {object} TBD
 * @return {Store} TBD
 * @throws {exceptions} TBD
 */

module.exports.getStore = function *(opts) {
  //this function will list all the  Store from database on the count of 10
  console.log("API getStore START ");
  try {
    var stores = yield storeDb.storeCollection.find({"store_id":opts.id}).exec();
    if(!stores){
      throw new Error("store_id  is invalid");
    }
    return stores;
  } catch(err) {
    throw err;  
  }
   
 };

/**
 * will update existing Store
 *
 * @param opts {object} TBD
 * @return {Store} TBD
 * @throws {exceptions} TBD
 */
  
module.exports.updateStore = function *(opts) {
  //this function will updateStore the existing Store from database on the basis of Store_id
  console.log("API updateStore START ");
  try {
    var stores = yield storeDb.storeCollection.findOne({"store_id":opts.id}).exec();
    if(!stores){
      throw new Error("store_id  is invalid");
    }
    if (opts.body["name"]) {
      stores.store_code = yield AppHelper.getCode(opts.body["name"]);
      stores.name = opts.body["name"];
    }
    
    stores.status = opts.body["status"];
    var saved_data = yield Promise.promisify(stores.save,stores)();
    return saved_data;
  } catch(err) {
      throw err;
  }  
}

/**
 * will delete existing Store
 *
 * @param opts {object} TBD
 * @return {Store} TBD
 * @throws {exceptions} TBD
 */

module.exports.storeDelete = function *(opts) {
  //this function will delete the existing Store from the database
  console.log("API StoreDelete START ");
  try {
    var stores = yield storeDb.storeCollection.findOne({"store_id":opts.id}).exec();
    if(!stores){
      throw new Error("store_id  is invalid");
    }
    yield storeDb.storeCollection.remove({"store_id":opts.id}).exec();
    return stores;
  } catch(err) {
    throw err;
  }  
};


var updateCategoryAttribute = function *(updation) {
   console.log("the new updation is ..",updation);
   var attributes_array = [];
   var category = yield categoryDb.categoryCollection.findOne({"name":updation.category}).exec();
   for(var i =0;i<updation.variations.length;i++) {
      for(var j=0;j < updation.variations[i].attributes.length; j++){
        console.log("attribuets is : ",updation.variations[i].attributes[j].name);
        attributes_array.push(updation.variations[i].attributes[j].name);
      }
   }
   if(!category){
      throw new Error("category  is invalid");
    }
    else {
      console.log("doing updation..",attributes_array);
      var updated = yield categoryDb.categoryCollection.update({"name" : updation.category},{ $addToSet: { "attributes": { $each: attributes_array } } }).exec();
      console.log("updated category is :..",updated);
      if(updated==1)
      yield ElasticAPI.updateCategoryIndex(category,updation.variations);


    }

    
};


