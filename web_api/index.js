'use strict';
var router = require("koa-router");
var route = new router();
exports = module.exports = route;
var api = require("../lib/store/api.js");
var eapi = require("../lib/store/elastic_api.js");

/**
 * @name POST /review
 * @desc
 * will add a review on the basis of request body
 *
 * Parameter          | Type     | Required | Description
 * :------------------|:---------|:---------|:-----------------------------------------------------
 *                    |          |          | 
 *
 * ** Returns **
 * will return the review added
 * 
 *
 * @example
 *
 * POST /review
 *
 */

route.post("/review", function *() {
  //will save the review to review database 
  console.log(" inside POST /review ");
  try {
    var newReview = yield api.addNewReview(this.request.body);
    this.body = newReview; 
  } catch(err){
    console.log(err);  
  }
  })

/**
 * @name GET /reviews/:product_id
 * @desc
 *
 * will find out the review on the basis of product_id
 *
 * Parameter          | Type     | Required | Description
 * :------------------|:---------|:---------|:-----------------------------------------------------
 *  product_id        |  string  |  yes     | 
 *
 * ** Returns **
 * will return review 
 * 
 *
 * @example
 *
 * GET /reviews/:product_id
 *
 */
route.get("/reviews/:product_id", function *() {  
  console.log(" inside GET /reviews/:product_id");
  try{
    var reviews = yield api.getReviews({
      "product_id" : this.params.product_id
    });
    this.body = reviews;
  } catch(err){
    this.body = ""+err;
  }
})

/**
 * @name PUT /review/:creator_id
 * @desc
 * will update the review info into review database on the basis of creator_id
 *
 * Parameter          | Type     | Required | Description
 * :------------------|:---------|:---------|:-----------------------------------------------------
 * creator_id         | string   |  yes     | 
 *
 * ** Returns **
 * will return the updated review
 * 
 *
 * @example
 *
 * PUT /review/:creator1122
 *
 */

route.put("/review/:creator_id", function *() {
  console.log(" inside PUT /review/:creator_id");
  try {
    var reviewUpdated = yield api.updateReview({
      "creator_id" : this.params.creator_id,
      "body" : this.request.body
       });
  this.body = reviewUpdated;
  } catch(err){
    this.body = ""+err; 
  }
  })

/**
 * @name DELETE /review/:creator_id
 * @desc
 *
 * will delete the review info into review database 
 *
 * Parameter          | Type     | Required | Description
 * :------------------|:---------|:---------|:-----------------------------------------------------
 * creator_id         | string   |  yes     | 
 *
 * ** Returns **
 * will return the deleted review
 * 
 *
 * @example
 *
 * DELETE /review/creator1122
 *
 */

route.delete("/review/:creator_id", function *() {
  console.log(" inside DELETE /review/:creator_id");
  try {
    var deletedReview = yield api.deleteReview({
      "creator_id" : this.params.creator_id,
    });
    this.body = deletedReview;
  } catch(err){
    this.body = ""+err;  
  }
})



/**
 * @name POST /category
 * @desc
 * will create a category on the basis of request body
 *
 * Parameter          | Type     | Required | Description
 * :------------------|:---------|:---------|:-----------------------------------------------------
 *                    |          |          | 
 *
 * ** Returns **
 * will return the category added
 * 
 *
 * @example
 *
 * POST /category
 *
 */

route.post("/category", function *() {
  //will save the category info in post to category database 
  console.log(" inside POST /category ",this.request.body);
  try {
    var newCategory = yield api.addNewCategory(this.request.body);
    this.body = newCategory; 
  } catch(err){
    console.log(err);  
  }
  })

/**
 * @name GET /category/
 * @desc
 *
 * will find out the parent categories in the category database.
 *
 * Parameter          | Type     | Required | Description
 * :------------------|:---------|:---------|:-----------------------------------------------------
 *                    |          |          | 
 *
 * ** Returns **
 * will return all the parent categories 
 * 
 *
 * @example
 *
 * GET /category/
 *
 */
route.get("/categories", function *() {  
  console.log(" inside GET /categories");
  try{
    var categories = yield api.getCategories();
    this.body = categories;
  } catch(err){
    this.body = ""+err;
  }
})

/**
 * @name GET /categories/:category_name
 * @desc
 *
 * will find out the categories inside parentCayegory.
 *
 * Parameter          | Type     | Required | Description
 * :------------------|:---------|:---------|:-----------------------------------------------------
 *  category_name     | string   | yes      | 
 *
 * ** Returns **
 * will return the child category on the basis of parent category_name
 * 
 *
 * @example
 *
 * GET /categories/Art&Design
 *
 */
route.get("/category/:category_name", function *() {  
  console.log(" inside GET /category/:category_name" , this.params.category_name);
  try{
    var categories = yield api.getSubCategories({
      "category_code" : this.params.category_name.replace(/\s+/g, ""),
    });
  this.body = categories;
  } catch(err){
    this.body = ""+err;
  }
})

/**
 * @name PUT /category/:category_name
 * @desc
 * will replace the category info into category database on the basis of category_name
 *
 * Parameter          | Type     | Required | Description
 * :------------------|:---------|:---------|:-----------------------------------------------------
 * category_name      | string   |  yes     | 
 *
 * ** Returns **
 * will return the updated category_name
 * 
 *
 * @example
 *
 * PUT /category/:ART$DESIGN
 *
 */

route.put("/category/:category_code", function *() {
  console.log(" inside PUT /category/:category_code");
  try {
    var categoryUpdated = yield api.updateCategory({
      "category_code" : this.params.category_code,
      "body" : this.request.body
       });
  this.body = categoryUpdated;
  } catch(err){
    this.body = ""+err; 
  }
  })

/**
 * @name DELETE /category/:category_name
 * @desc
 *
 * will delete the category info into category database 
 *
 * Parameter          | Type     | Required | Description
 * :------------------|:---------|:---------|:-----------------------------------------------------
 * category_name      | string   |  yes     | 
 *
 * ** Returns **
 * will return the deleted category
 * 
 *
 * @example
 *
 * DELETE /category/:category_name
 *
 */



route.delete("/category/:category_code", function *() {
  console.log(" inside DELETE /category/:category_code");
  try {
    var deletedCategory = yield api.deleteCategory({
      "category_code" : this.params.category_code,
    });
    this.body = deletedCategory;
  } catch(err){
    this.body = ""+err;  
  }
})


/**
 * @name GET /product/:product_id
 * @desc
 *
 * will delete the stores on the basis of store_id.
 *
 * Parameter          | Type     | Required | Description
 * :------------------|:---------|:---------|:-----------------------------------------------------
 *  product_id        | string   | yes      | 
 *
 * ** Returns **
 * will return the product on the basis of product_id
 * 
 *
 * @example
 *
 * GET /product/1234
 *
 */


route.get("/product/:product_code", function *() {  
  console.log(" inside GET /product/:product_code");
  try{
  var product = yield api.getProduct({
    "product_code" : this.params.product_code,
    });
  this.body = product;
  } catch(err){
  this.body = ""+err;
  }
})



/**
 * @name GET /product?limit=integer&skip=integer
 * @desc
 * will display products as defined in skip and limit
 *
 * Parameter          | Type     | Required | Description
 * :------------------|:---------|:---------|:-----------------------------------------------------
 * limit              | Integer  |  optional|
 * skip               | Integer  |  optional| 
 *
 * ** Returns **
 *JSON object products
 * 
 *
 * @example
 *
 * GET /product?limit=10&skip=1
 *
 */


route.get("/product", function *() {  
  console.log(" inside GET /product");
  try{
  var products = yield api.getAllProduct({
    "limit" : this.request.query.limit || 10,
    "skip" : this.request.query.skip || 0
  });
  this.body = products;
  } catch(err){
  console.log(err);  
  }
})

/**
 * @name GET /product/category/:category_code
 * @desc
 *
 * will delete the stores on the basis of store_id.
 *
 * Parameter          | Type     | Required | Description
 * :------------------|:---------|:---------|:-----------------------------------------------------
 *  category_code     | string   | yes      | 
 *
 * ** Returns **
 * will return the products on the basis of category_code
 * 
 *
 * @example
 *
 * GET /product/category/textiles
 *
 */


route.get("/product/category/:category_code", function *() {  
  console.log(" inside GET /product/category/:category_code");
  try{
  var products = yield api.getProductsForCategory({
    "category_code" : this.params.category_code,
    });
  this.body = products;
  } catch(err){
  this.body = ""+err;
  }
})


/**
 * @name POST /product
 * @desc
 * will create a product on the basis of request body
 *
 * Parameter          | Type     | Required | Description
 * :------------------|:---------|:---------|:-----------------------------------------------------
 *                    |          |          | 
 *
 * ** Returns **
 * will return the product added
 * 
 *
 * @example
 *
 * POST /product
 *
 */
route.post("/product", function *() {
  //will save the product info in postto product database 
  console.log(" inside POST /product ",this.request.body);
  try {
    var newUser = yield api.addNewProduct(this.request.body);
    this.body = newUser; 
  } catch(err){
    console.log(err);  
  }
  });
// route.post("/product", function *() {
//   //will save the product info in postto product database 
//   console.log(" inside POST /product ");
//   try {
//     var newProductAdded = yield api.addNewProduct(this.request.body);
//     this.body = newProductAdded; 
//   } catch(err){
//     console.log(err);  
//   }
//   })

/**
 * @name PUT /product/:product_id
 * @desc
 * will replace the product info into product database on the basis of product_id
 *
 * Parameter          | Type     | Required | Description
 * :------------------|:---------|:---------|:-----------------------------------------------------
 * product_id         | string   |  yes     | 
 *
 * ** Returns **
 * will return the updated product
 * 
 *
 * @example
 *
 * PUT /product/1234
 *
 */

route.put("/product/:product_id", function *() {
  console.log(" inside PUT /product/:product_id");
  try {
    var productUpdated = yield api.updateProduct({
      "id" : this.params.product_id,
      "body" : this.request.body
       });
  this.body = productUpdated;
  } catch(err){
    this.body = ""+err; 
  }
  })


/**
 * @name DELETE /product/:product_id
 * @desc
 *
 * will delete the product info into product database 
 *
 * Parameter          | Type     | Required | Description
 * :------------------|:---------|:---------|:-----------------------------------------------------
 * product_id         | string   |  yes     | 
 *
 * ** Returns **
 * will return the deleted product
 * 
 *
 * @example
 *
 * DELETE /product/1234
 *
 */



route.delete("/product/:product_id", function *() {
  console.log(" inside DELETE /product/:product_id");
  try {
    var productDeleted = yield api.productDelete({
      "id" : this.params.product_id,
    });
    this.body = productDeleted;
  } catch(err){
    this.body = ""+err;  
  }
})
/**
 * @name GET /store/:store_id
 * @desc
 *
 * will delete the stores on the basis of store_id.
 *
 * Parameter          | Type     | Required | Description
 * :------------------|:---------|:---------|:-----------------------------------------------------
 *  store_id          | string   | yes      | 
 *
 * ** Returns **
 * will return the deleted product
 * 
 *
 * @example
 *
 * GET /store/1234
 *
 */


route.get("/store/:store_id", function *() {  
  console.log(" inside GET /store/:store_id");
  try{
    var stores = yield api.getStore({
      "id" : this.params.store_id,
    });
    this.body = stores;
  } catch(err){
    this.body = ""+err;
  }
})

/**
 * @name POST /store
 * @desc
 *
 * will create a store on the basis of request body
 *
 * Parameter          | Type     | Required | Description
 * :------------------|:---------|:---------|:-----------------------------------------------------
 *                    |          |          | 
 *
 * ** Returns **
 * will return the new added store
 * 
 *
 * @example
 *
 * POST /store
 *
 */

route.post("/store", function *() {
  console.log(" inside POST /store ");
  try {
    var newStoreAdded = yield api.addNewStore(this.request.body);
    this.body = newStoreAdded; 
  } catch(err){
    console.log(err);  
  }
  })

/**
 * @name PUT /store/:store_id
 * @desc
 *
 * will replace the store info into store database on the basis of store_id
 *
 * Parameter          | Type     | Required | Description
 * :------------------|:---------|:---------|:-----------------------------------------------------
 * store_id           | string   |  yes     | 
 *
 * ** Returns **
 * will return the store on the basis of product id
 * 
 *
 * @example
 *
 * PUT /store/1234
 *
 */

route.put("/store/:store_id", function *() {
  console.log(" inside PUT /store/:store_id");
  try {
      var storeUpdated = yield api.updateStore({
        "id" : this.params.store_id,
        "body" : this.request.body
    });
    this.body = storeUpdated;
  } catch(err){
    console.log(err);  
    this.body = ""+err;
  }
  })


/**
 * @name DELETE /store/:store_id
 * @desc
 *
 * will delete the store info into store database 
 *
 * Parameter          | Type     | Required | Description
 * :------------------|:---------|:---------|:-----------------------------------------------------
 * store_id           | string   |  yes     | 
 *
 * ** Returns **
 * will return the deleted product
 * 
 *
 * @example
 *
 * DELETE /store/1234
 *
 */



route.delete("/store/:store_id", function *() {
  console.log(" inside DELETE /store/:store_id");
  try {
    var storeDeleted = yield api.storeDelete({
      "id" : this.params.store_id,
    });
    this.body = storeDeleted;
  } catch(err){
    this.body = ""+err;  
  }
})





route.post("/search", function *() {  
  console.log(" inside GET /search",this.request.body);
  
  try{
  var products = yield eapi.getProductSearch({
    query : this.request.body.query,
    page: this.request.body.page,
    per_page: this.request.body.per_page,
    min_price: this.request.body.min,
    max_price: this.request.body.max,
    autoComplete : this.request.body.autoComplete
    // attribute: this.request.body.attribute 
  });
  this.body = products;
  } catch(err){
  console.log(err);  
  }
})


route.post("/search/category", function *() {  
  console.log(" inside GET category /search",this.request.body);
  
  try{
  var category = yield eapi.getCategorySearch({
    query : this.request.body.query,
    
  });
  this.body = category;
  } catch(err){
  console.log(err);  
  }
})