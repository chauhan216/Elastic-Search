'use strict';
var router = require("koa-router");
var route = new router();
exports = module.exports = route;
var api = require("../lib/store/api.js");
var eapi = require("../lib/store/elastic_api.js");






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
  var result = yield api.searchProducts({
    name : this.request.body
  });
  this.body = result;
})