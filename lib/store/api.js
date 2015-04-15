'use strict';
var Promise = require('bluebird');
var productDb = require("./store_product_schema.js");
var storeDb = require("./store_schema.js");
var categoryDb = require("./category_schema.js");
var reviewDb = require("./product_reviews_schema.js");
var AppHelper = require('./helper.js');
var ElasticAPI = require('./elastic_api');




/**
 * Add new category
 *
 * @param opts {object} TBD
 * @return {category} TBD
 * @throws {exceptions} TBD
 */

module.exports.addNewCategory = function*(opts) {
    //this function will create a new category in database
    console.log("API addNewCategory  START");
    var category = new categoryDb.categoryCollection(opts);
    if (!category.parent_category) {
        category.parent_category = "";

    }
    console.log("all category options are :", opts);
    category.category_code = yield AppHelper.getCode(category.name);
    console.log("all category options are :", category);
    try {
        var saved_data = yield Promise.promisify(category.save, category);
        console.log("API addNewCategory saved_data:" + JSON.stringify(saved_data));
        return saved_data;
    } catch (err) {
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

module.exports.getCategories = function*() {
    //this function will list all parent category
    console.log("API getCategories START ");
    try {
        var categories = yield categoryDb.categoryCollection.find({
            "parent_category": ""
        }).exec();
        if (!categories) {
            throw new Error("no category found");
        }

        console.log("category found" + JSON.stringify(categories));

        return categories;
    } catch (err) {
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

module.exports.getSubCategories = function*(opts) {
    //this function will list all  subcategoires for category
    var thisattributes = [];
    console.log("API getChildCategories START ", opts);
    try {
        var parentCategory = yield categoryDb.categoryCollection.findOne({
            "category_code": opts.category_code
        }).exec();
        console.log("parentCategory" + parentCategory.name);
        if (!parentCategory) {
            throw new Error("parentCategory  is invalid");
        }
    } catch (err) {
        throw err;
    }
    try {
        var categories = yield categoryDb.categoryCollection.find({
            "parent_category": parentCategory.name
        }).lean().exec();
        
        if (!categories) {
            throw new Error("subcategoires not found");
        };
        categories =  yield ElasticAPI.categoryCount(parentCategory,categories);  
        thisattributes = parentCategory.attributes;
        var result = yield ElasticAPI.attributeCount(parentCategory,thisattributes,categories);
        var finalResult = {}
        finalResult["subcategories"] = categories;
        finalResult["attributes"] = thisattributes;
        finalResult["countBrand"] = result.brands;
        finalResult["priceRange"] = result.price;

        return finalResult;
    } catch (err) {
        throw err;
    }

}





/**
 * Get a single product
 *
 * @param opts {object} TBD
 * @return {product} TBD
 * @throws {exceptions} TBD
 */

module.exports.getProduct = function*(opts) {
    //this function will list all the  Store from database on the count of 10
    console.log("API getProduct START ");
    try {
        var product = yield productDb.productCollection.find({
            "product_code": opts.product_code
        }).exec();
        if (!product) {
            throw new Error("product_code  is invalid");
        }
        return product;
    } catch (err) {
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

module.exports.getProductsForCategory = function*(opts) {
    //this function will list all the  products from database on the basis of category_code
    console.log("API getProductsForCategory START");
    try {
        var categories = yield categoryDb.categoryCollection.find({
            "parent_category": opts.category_code
        }).exec();
        var inArray = [];
        inArray[0] = opts.category_code;
        for (var i = 0; i < categories.length; i++) {
            inArray[i + 1] = categories[i].category_code;
        }
        var query = {
            "category_code": {
                '$in': inArray
            }
        };
        var products = yield productDb.productCollection.find(query).exec();
        if (!products) {
            throw new Error("No products found for this category");
        }
        return products;
    } catch (err) {
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

module.exports.addNewProduct = function*(opts) {
    //this function will create a new product in databas

    console.log("API addNewProduct  START", opts);
    var product = new productDb.productCollection(opts);
    try {
        product.product_code = yield AppHelper.getCode(product.name);
        var savedData = yield Promise.promisify(product.save, product);
        yield ElasticAPI.addProductInElastic(savedData[0]);
        return savedData;
    } catch (err) {
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

module.exports.getAllProduct = function*(opts) {
    //this function will list all the  product from database on the count of 10
    console.log("API List START ");
    try {
        var products = yield productDb.productCollection.find({}).limit(opts.limit).skip(opts.skip).exec();
        return products;
    } catch (err) {
        console.log("err" + err);
        throw err;
    }

};




var updateCategoryAttribute = function*(updation) {
    console.log("the new updation is ..", updation);
    var attributes_array = [];
    var category = yield categoryDb.categoryCollection.findOne({
        "name": updation.category
    }).exec();
    for (var i = 0; i < updation.variations.length; i++) {
        for (var j = 0; j < updation.variations[i].attributes.length; j++) {
            console.log("attribuets is : ", updation.variations[i].attributes[j].name);
            attributes_array.push(updation.variations[i].attributes[j].name);
        }
    }
    if (!category) {
        throw new Error("category  is invalid");
    } else {
        console.log("doing updation..", attributes_array);
        var updated = yield categoryDb.categoryCollection.update({
            "name": updation.category
        }, {
            $addToSet: {
                "attributes": {
                    $each: attributes_array
                }
            }
        }).exec();
        console.log("updated category is :..", updated);
        if (updated == 1)
            yield ElasticAPI.updateCategoryIndex(category, updation.variations);


    }


};


module.exports.searchProducts = function*(opts) {
    console.log("opts are :", opts);
    var finalResult = {
        product: [],

    }
    var thisattributes = [];
    var total = 0;
    if (opts.name.category) {
        var parentCategory = yield categoryDb.categoryCollection.findOne({
            "name": opts.name.category
        }).exec();
        console.log("parent sis :", parentCategory.attributes);
        thisattributes = parentCategory.attributes;
        var subCategory = yield categoryDb.categoryCollection.find({
            "parent_category": opts.name.category
        }).lean().exec(); 
    } else if (opts.name.subCategory) {
        var subCategory = yield categoryDb.categoryCollection.find({
            "name": opts.name.subCategory
        }).exec();
        console.log("sub cate is =",subCategory)
        thisattributes = subCategory[0].attributes;
    }

    for(var i= 0; i<subCategory.length;i++){
      console.log("hello the next is :", subCategory[i].name);
      var result =  yield ElasticAPI.allProducts({"category":subCategory[i].name});
      console.log("result is ",result);
      total  = total + result.total;
       for(var j in result.product) {
        finalResult.product.push(result.product[j]);
        console.log("added");
       }
    };
    finalResult["total"] = total;
    console.log("attributes are :",thisattributes);
    if(thisattributes.length>0) {
      finalResult["attributes"] = thisattributes;
    }
    if(opts.name.subCategory) {
     var attributes = [];
        finalResult.attributes.forEach(function(value){
          var attribute ={
            name : "",
            values:[]
          }
          for(var i=0;i<finalResult.product.length;i++)
          {
            finalResult.product[i].attributes.forEach(function(attr) {
              if(attr.name==value){
                 attribute["name"]=attr.name;
                 attribute["values"].push(attr.value);
              }
            });
          }
          attributes.push(attribute);
        });
        finalResult.attributes = attributes;
        finalResult.attributes = yield ElasticAPI.countSubcategoryAttributes(thisattributes,opts.name.subCategory); 
     }
    
    console.log(".........",finalResult.attributes);
    return finalResult;
}
