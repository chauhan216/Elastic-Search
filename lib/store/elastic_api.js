var router = require("koa-router");
var Promise = require('bluebird');
// exports = module.exports = API;
var config = require('../../config')
var API = require('./api.js');
var elasticsearch = require('elasticsearch');
var self = require('./elastic_api.js');
var es = new elasticsearch.Client({
    host: config.elastic.url
});
var underscore = require("underscore");

module.exports.addProductInElastic = function*(opts) { // for adding product in index
    var variations_price = [];
    console.log(opts);
    var variations_attribute = [];
    if (opts.variations) {
        for (var i = 0; i < opts.variations.length; i++) {
            console.log("obj:" + opts.variations[i].Pricing.regularPrice);
            variations_price.push(opts.variations[i].Pricing.regularPrice);
            opts.variations[i].attributes.forEach(function(data) {
                var attr = {};
                attr[data.name]  = data.value;
                variations_attribute.push(attr);
            } )
        }
    }
    console.log("huhuhuh....................",opts);
        console.log("variaton attribute..",variations_attribute);
    
    

    console.log("API addProductInElastic  START" + opts["category"]);
    console.log("API addProductInElastic  START" + opts["deliveryspecs"]);
    
    yield es.index({
        index: config.elastic.productIndexName,
        type: config.elastic.productIndexName,
        id: opts.product_code,
        body: {
            "product_code": opts.product_code,
            "name": opts.name,
            "description": opts.description,
            "category": opts.category,
            "subcategory": opts.subcategory,
            "deliveryspecs": opts.deliveryspecs,
            "returnsspecs": opts.returnsspecs,
            "brand": opts.details.brand,
            "manufacturer": opts.details.manufacturer,
            "price": variations_price,
            "attribute": variations_attribute,

        }
    }).then(function(response) {
        console.log("Indexed: ", response);
        return;
    }, function(error) {
        console.log("Index failed: ", error.message);
    });
    
}

module.exports.getProductSearch = function*(opts) { // for find product from index
    console.log("inside get index in elastic search", opts.autoComplete);
    console.log("inside get index in elastic search", opts);
    var products = [];

    var reply = {
        page: opts.page || 1,
        per_page: opts.per_page || 10,
        product: [],


    }
    var productES = {
        body: [{
            index: config.elastic.productIndexName,
            type: config.elastic.productIndexName
        }, {
            query: {},
            // "term": { "rank": 26 },
            "from": (reply.page - 1),
            "size": reply.per_page
        }]
    };


    // productES.body[1] = {};
    // opts.query = opts.query.trim().split(/\s+/);
    // console.log("hello.",opts.query);
    if (opts.autoComplete) {
        productES.body[1]["query"] = {
            "match_phrase_prefix": {
                "name": opts.query
            }
        };

    } else if(opts.query.filtered){
        console.log("hey u gave the query..");
        productES.body[1]["query"] = opts.query;
        console.log("the query would be :..",  productES.body[1]["query"]);
    } else {
         console.log("in multimatch");
        productES.body[1]["query"].filtered = {
            "query": {
                "multi_match": {
                    "query": opts.query,
                    "type": "phrase_prefix",
                    "fields": ["name^10", "description", "category", "deliveryspecs", "shippingspecs", "brand", "manufacturer", "subcategory"]
                }
            }
        };
    }
    console.log("product query is :", productES.body[1].query);
    var responseProduct = yield Promise.promisify(es.msearch, es)(productES);
    console.log("responseProduct", JSON.stringify(responseProduct[0]));
    if (typeof(responseProduct[0].responses[0].hits.hits) !== 'undefined') {
        for (var i in responseProduct[0].responses[0].hits.hits) {
            products.push(responseProduct[0].responses[0].hits.hits[i]['_source']['product_code']);
        }
    }
    for (var j in products) {
        var productData = yield API.getProduct({
            'product_code': products[j]
        });
        if (productData.length > 0) {

            reply.product.push(productData);
        }
    }
    reply["total"] = responseProduct[0].responses[0].hits.total;
    return reply;
}

module.exports.deleteProductIndex = function*(opts) { // for deleting product from index
    console.log("deleteProductIndex in elastic search");
    var products = [];
    var reply = {
        page: opts.page || 1,
        per_page: opts.per_page || 10,
        product: [],
        min_price: opts.min_price,
        max_price: opts.max_price
    }

    es.delete({
        index: config.elastic.productIndexName,
        type: config.elastic.productIndexName,
        id: opts.product_code
    }, function(error, response) {
        console.log("response:" + JSON.stringify(response));
        return reply;
    });


}
// for finding product attribute from index

module.exports.getProductAttribute = function*(opts) { 
    console.log("inside getProductAttribute");
    var products = [];
    var reply = {
        page: opts.page || 1,
        per_page: opts.per_page || 10,
        product: [],
        min_price: opts.min_price,
        max_price: opts.max_price,
        attribute: []

    }
    var productES = {
        body: [{
            index: config.elastic.productIndexName,
            type: config.elastic.productIndexName
        }, {
            query: {
                query_string: {
                    query: opts.query
                }
            },
            // "term": { "rank": 26 },
        }]
    };
    var responseProduct = yield Promise.promisify(es.msearch, es)(productES);
    console.log("responseProduct", JSON.stringify(responseProduct[0]));

    if (typeof(responseProduct[0].responses[0].hits.hits) !== 'undefined') {
        for (var i in responseProduct[0].responses[0].hits.hits) {
            products.push(responseProduct[0].responses[0].hits.hits[i]['_source']);
        }
    }
    var attributearray = [{
        "weight": ['200', '300']
    }];
    for (var j in products) {
        console.log("products", products[j]);

        if (products[j].attribute && products[j].attribute.length > 1) {
            for (var attribute in products[j].attribute) {
                console.log("attribute--" + attribute);
                console.log("attribute--" + JSON.stringify(products[j].attribute[attribute]));
                attributeKey = Object.keys(products[j].attribute[attribute]);
                // console.log("attributeKey" + attributeKey); 
                if (products[j].attribute[attribute]) {
                    var isExist = function(element, index, array) {
                        if (Object.getOwnPropertyNames(element)[0] === attributeKey[0]) {
                            console.log("yes---->" + Object.getOwnPropertyNames(element).indexOf('weight'));
                            return true;
                        }
                    }
                    var keydata = attributearray.find(isExist);
                    console.log("--keydata---> " + JSON.stringify(keydata));

                    if (keydata) {
                        console.log("keydata:" + Object.keys(keydata));
                        console.log("attributeKey:" + JSON.stringify(attributeKey));
                        for (var e in keydata) {
                            console.log("key exist c:" + e);
                            console.log("key exist a[c]:" + keydata[e]);
                            for (var d in products[j].attribute[attribute]) {
                                console.log("---d---" + JSON.stringify(products[j].attribute[attribute][d][0]));
                                var index = keydata[e].indexOf(products[j].attribute[attribute][d][0]);
                                console.log("key exist keydata[c]:" + index);
                                console.log("----attributearray before:" + JSON.stringify(attributearray));
                                if (index < 0) {
                                    console.log("matched not found in array insert it");
                                    keydata[e].push(products[j].attribute[attribute][d][0]);
                                }
                                console.log("----new array:" + JSON.stringify(keydata));
                                console.log("----attributearray after:" + JSON.stringify(attributearray));
                            }
                        }
                    } else {
                        attributearray.push(products[j].attribute[attribute]);
                    }
                    console.log("new attributearray:" + JSON.stringify(attributearray));
                    // var newattribute = test;
                    // attributearray.push({test : "5"});                 
                }
            }
        }

        var productData = yield API.getProduct({
            'product_code': products[j].product_code
        });

        reply.product.push(productData);
    }
    reply.attribute = attributearray;
    return reply;
}

// module.exports.isExist = function (element, index, array) {
//         // function isExist(element, index, array) {
//           console.log("---- isExist called" + Object.getOwnPropertyNames(element));
//           if(Object.getOwnPropertyNames(element)){
//             console.log("yes " + Object.getOwnPropertyNames(element))
//             return true;
//           } else {
//             return false;
//           }
//         }


// for adding category in index
module.exports.addCategoryInElastic = function*(opts) { 
    console.log("options for indexing are :...",opts);
    yield es.index({
        index: config.elastic.categoryIndexName,
        type: opts.name,
        id: opts.category_code,
        body: {
            "category_code" : opts.category_code,
            "name" : opts.name,
            "attribute" : opts.attributes,
            "parent_category" : opts.parent_category


        }
    }).then(function(response) {
        console.log("category Indexed: ", response);
        return;
    }, function(error) {
        console.log("Index failed: ", error.message);
    });
 
};



// to update the category attributes whenever new product is inserted

module.exports.updateCategoryIndex = function *(category,opts) {
    console.log("category is :", category);
    console.log("opts are :",opts[0]);
    var allAttributes = [];

    for (var i=0;i < opts[0].attributes.length; i++){
        var newAttribute = {};
       newAttribute[opts[0].attributes[i].name] =  [opts[0].attributes[i].value];
        allAttributes.push(newAttribute);
    }
    console.log("..attributes to be aaded are:",allAttributes);
    var categoryES = {
        body :[{
            index: config.elastic.categoryIndexName,
            type: category.name,
            id: category.category_code        
        },{query :{ match_all:{}}}
        ]
    };
    var responseCategory = yield Promise.promisify(es.msearch, es)(categoryES);
    console.log("the attributes are ..",JSON.stringify(responseCategory[0]));
    var gotCategory = responseCategory[0].responses[0].hits.hits[0]["_source"];
    console.log("got category is :");
    if(gotCategory.attribute.length == 0) {
        gotCategory.attribute = allAttributes;
    } else { 
             var _ = underscore;

           var extraAttributes =[];
           var availableAttributes =[];
            gotCategory.attribute.forEach( function(data) {
            console.log("key will be:" ,Object.keys(data)); 
            var _ = underscore;
            var count = 0;
            allAttributes.forEach( function (value) {
                console.log("value keys is :",Object.keys(value)[0]);
            if(Object.keys(value)[0]==Object.keys(data)[0]) {
                count =1;
                console.log("data keys is :",Object.keys(data)[0] );
                console.log("value keys is :",Object.keys(value)[0]);
                data[Object.keys(data)[0]] = _.union(data[Object.keys(data)[0]],value[Object.keys(value)[0]]);
                var attr = {};
                attr[Object.keys(value)[0]] = value[Object.keys(value)[0]];
                console.log("the match is :",attr);
                availableAttributes.push(attr);
            }
            

            })
            
            
        } );
            console.log("available attributes are :",availableAttributes);
           allAttributes.forEach(function(data) {
            var found = false;
              availableAttributes.forEach(function(value) {
                if(_.isEqual(data,value)) {
                    // allAttributes.splice(allAttributes.indexOf(data),1);
                    // availableAttributes.splice(availableAttributes.indexOf(data),1);
                    found =true;
                }
              });
              if(!found) {
                extraAttributes.push(data);
              }
           })   
           
           console.log("availableAttributes",availableAttributes)
           console.log("extra attribtes are :",extraAttributes);
           console.log("allAttributes are: ",gotCategory.attribute);
           

           if(extraAttributes.length>0) {
            
                gotCategory.attribute = _.union(gotCategory.attribute,extraAttributes);
        
           }
    }
    console.log("the index is :" ,JSON.stringify(gotCategory));
    yield es.index({
        index: config.elastic.categoryIndexName,
        type: category.name,
        id: category.category_code,
        body: gotCategory
    }).then(function(response) {
        console.log("category Indexed: ", response);
        return;
    }, function(error) {
        console.log("Index failed: ", error.message);
    });
  

};

//method to search the category index 

module.exports.getCategorySearch = function*(opts) {
    console.log("the category query is :",opts.query);
    if(opts.query.name.indexOf(" ") > 0) {
        var nameQuery = opts.query.name.substr(0,opts.query.name.indexOf(" ")).toLowerCase();
    }
    else
    {
        var nameQuery = opts.query.name.toLowerCase();
    }
    var categoryES = {
        body :[{
            index : config.elastic.categoryIndexName,
            type : opts.name,
           
        }, {query :{ "match" : {"name" : nameQuery}  }}
        ]
    };
    var responseCategory = yield Promise.promisify(es.msearch, es)(categoryES);
    console.log("response is :",JSON.stringify(responseCategory[0]));
    return responseCategory[0].responses[0].hits.hits[0]["_source"].attribute;
}
