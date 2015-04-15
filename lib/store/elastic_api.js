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
    if (opts.attributes) {

        opts.attributes.forEach(function(data) {
            var attr = {};
            attr[data.name.replace(/\s/g, "").toLowerCase()] = data.value;
            variations_attribute.push(attr);
        })

    }
    // console.log("huhuhuh....................",opts);
    console.log("variaton attribute..", variations_attribute);



    // console.log("API addProductInElastic  START" + opts["category"]);
    // console.log("API addProductInElastic  START" + opts["deliveryspecs"]);

    yield es.index({
        index: config.elastic.productIndexName,
        type: "product",
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
            "attribute": variations_attribute,
            "price": opts.pricing.offerPrice

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
            type: "product"
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

    } else if (opts.query.filtered) {
        console.log("hey u gave the query..");
        productES.body[1]["query"] = opts.query;
        console.log("the query would be :..", productES.body[1]["query"]);
    } else if (opts.query.range) {
        productES.body[1]["query"] = opts.query;
    } else {
        console.log("in multimatch");
        productES.body[1]["query"].filtered = {
            "query": {
                "multi_match": {
                    "query": opts.query,
                    "type": "phrase_prefix",
                    "fields": ["name^10", "description", "category", "deliveryspecs", "brand", "manufacturer"]
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
            for (var k in productData) {
                reply.product.push(productData[k]);
            }

        }
    }
    reply["total"] = responseProduct[0].responses[0].hits.total;
    return reply;
}

module.exports.allProducts = function*(opts) {
    console.log("in elastic ", opts);
    var products = [];
    var reply = {
        product: [],
    }
    var productQuery = {
        body: [{
            index: config.elastic.productIndexName,
            type: "product"
        }, {
            query: {
                "match": {
                    "category.org": opts.category
                }
            },
            // "term": { "rank": 26 },
            "from": 0,
            "size": 10
        }]
    };
    console.log("query i s:", productQuery.body[1].query);
    var responseProduct = yield Promise.promisify(es.msearch, es)(productQuery);
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
            for (var k in productData) {
                reply.product.push(productData[k]);
            }
        }
    }
    console.log("all reeply will be :", reply);
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


module.exports.categoryCount = function*(parent, childs) {
    console.log("parents are ", parent.name);
    console.log("childs are :", childs);
    var filters = {};
    for (var i = 0; i < childs.length; i++) {
        console.log("update i s:", childs[i].name.replace("And", "&"));
        filters["category" + i] = {
            "term": {
                "category.org": childs[i].name.replace("And", "&")
            }
        }
    }
    console.log("filters is ", filters);
    var countQuery = {
        body: [{
            index: config.elastic.productIndexName,
            type: "product"
        }, {
            "size": 0,
            "aggs": {
                "counts": {
                    "filters": {
                        "filters": filters
                    }
                }
            }
        }]
    };
    console.log("there is query ", JSON.stringify(countQuery));
    var response = yield Promise.promisify(es.msearch, es)(countQuery);
    var allCounts = response[0].responses[0].aggregations.counts.buckets;
    console.log("counts are ", allCounts);
    for (var i = 0; i < childs.length; i++) {

        console.log("..", allCounts["category" + i]["doc_count"]);
        var value = allCounts["category" + i]["doc_count"];
        console.log("value si.. ", value);
        childs[i]["count"] = value;

    }
    console.log("now childs are ", childs);
    return childs;
}

module.exports.attributeCount = function*(parent, data, subcategory) {
    console.log("[parent is /", parent);
    console.log("data is ", data);
    console.log("su is ..", subcategory);
    var termsArray = [];
    var allbuckets = {
        "brands": [],
        "price": []
    };
    // for (var i = 0; i < subcategory.length; i++) {
    //     var countQuery1 = {
    //         body: [{
    //             index: config.elastic.productIndexName,
    //             type: "product"
    //         }, {
    //             "query": {
    //                 "match_phrase": {
    //                     "category": subcategory[i].name
    //                 }
    //             },
    //             "size": 0,
    //             "aggs": {}
    //         }]
    //     };
    //     console.log("this is ", subcategory[i].name);
    //     for (var j = 0; j < data.length; j++) {

    //         if (data[j] == "Brand") {
    //             var x = data[j].replace(" ", "").toLowerCase() + ".org";
    //             console.log("x is :", x);
    //             countQuery1.body[1]["aggs"] = {
    //                 "count": {
    //                     "terms": {
    //                         "field": x,
    //                         "size": 30
    //                     }
    //                 }
    //             };
    //             // console.log("it will be ",JSON.stringify(countQuery1.body[1]));
    //             var response = yield Promise.promisify(es.msearch, es)(countQuery1);
    //             // console.log("response is ",JSON.stringify(response));
    //             var result = response[0].responses[0].aggregations.count.buckets;
    //             result.forEach(function(e) {
    //                 allbuckets["brands"].push(e);
    //             });
    //         } else if (data[j] == "Price") {
    //             countQuery1.body[1]["aggs"] = {
    //                 "min_price": {
    //                     "min": {
    //                         "field": "price"
    //                     }
    //                 }
    //             };
    //             var response = yield Promise.promisify(es.msearch, es)(countQuery1);
    //             // console.log("response is ",JSON.stringify(response));
    //             var min = response[0].responses[0].aggregations.min_price.value;
    //             countQuery1.body[1]["aggs"] = {
    //                 "max_price": {
    //                     "max": {
    //                         "field": "price"
    //                     }
    //                 }
    //             };
    //             var response = yield Promise.promisify(es.msearch, es)(countQuery1);
    //             // console.log("response is ",JSON.stringify(response));
    //             var max = response[0].responses[0].aggregations.max_price.value;
    //             var x = data[j].toLowerCase();
    //             console.log("min-"+min+"   &  max-" +max);
    //             countQuery1.body[1]["aggs"] = {
    //                 "rangesPrice": {
    //                     "range": {
    //                         "field": "price",
    //                         "ranges": [{
    //                             "to": 5
    //                         }, {
    //                             "from": 5,
    //                             "to": 10
    //                         }, {
    //                             "from": 10,
    //                             "to": 15
    //                         }, {
    //                             "from": 15
    //                         }]
    //                     }
    //                 }
    //             };
    //             var response = yield Promise.promisify(es.msearch, es)(countQuery1);
    //             // console.log("response is ",JSON.stringify(response));
    //             var result = response[0].responses[0].aggregations.rangesPrice.buckets;
    //             result.forEach(function(e) {
    //                 allbuckets["price"].push(e);
    //             });

    //         }

    //     }
    // }













    // console.log("this is ", subcategory[i].name);
    for (var j = 0; j < data.length; j++) {
        var countQuery1 = {
            body: [{
                index: config.elastic.productIndexName,
                type: "product"
            }, {
                "query": {},
                "size": 0,
                "aggs": {}
            }]
        };

        for (var i = 0; i < subcategory.length; i++) {
            countQuery1.body[1]["query"] = {
                "match_phrase": {
                    "category": subcategory[i].name
                }
            }
            if (data[j] == "Brand") {
                var x = data[j].replace(" ", "").toLowerCase() + ".org";
                console.log("x is :", x);
                countQuery1.body[1]["aggs"] = {
                    "count": {
                        "terms": {
                            "field": x,
                            "size": 30
                        }
                    }
                };

                // console.log("it will be ",JSON.stringify(countQuery1.body[1]));
                var response = yield Promise.promisify(es.msearch, es)(countQuery1);
                // console.log("response is ",JSON.stringify(response));
                var result = response[0].responses[0].aggregations.count.buckets;
                result.forEach(function(e) {
                    allbuckets["brands"].push(e);
                });
            } else if (data[j] == "Price") {
                countQuery1.body[1]["aggs"] = {
                    "min_price": {
                        "min": {
                            "field": "price"
                        }
                    }
                };
                var response = yield Promise.promisify(es.msearch, es)(countQuery1);
                // console.log("response is ",JSON.stringify(response));
                var min = response[0].responses[0].aggregations.min_price.value;
                countQuery1.body[1]["aggs"] = {
                    "max_price": {
                        "max": {
                            "field": "price"
                        }
                    }
                };
                var response = yield Promise.promisify(es.msearch, es)(countQuery1);
                // console.log("response is ",JSON.stringify(response));
                var max = response[0].responses[0].aggregations.max_price.value;
                var x = data[j].toLowerCase();
                console.log("for the ," + subcategory[i].name + " min-" + min + "   &  max-" + max);
                countQuery1.body[1]["aggs"] = {
                    "rangesPrice": {
                        "range": {
                            "field": "price",
                            "ranges": [{
                                "to": 5
                            }, {
                                "from": 5,
                                "to": 10
                            }, {
                                "from": 10,
                                "to": 15
                            }, {
                                "from": 15
                            }]
                        }
                    }
                };
                var response = yield Promise.promisify(es.msearch, es)(countQuery1);
                // console.log("response is ",JSON.stringify(response));
                var result = response[0].responses[0].aggregations.rangesPrice.buckets;
                result.forEach(function(e) {
                    allbuckets["price"].push(e);
                });

            }

        }
    }
    console.log("all buckets are :", allbuckets);
    for (var i = 0; i < allbuckets["brands"].length; i++) {
        for (var j = i + 1; j < allbuckets["brands"].length; j++) {
            if (allbuckets["brands"][i].key == allbuckets["brands"][j].key) {
                allbuckets["brands"][i]["doc_count"] = allbuckets["brands"][i]["doc_count"] + allbuckets["brands"][j]["doc_count"];
                allbuckets["brands"].splice(j, 1);
            }
        }
    }
    for (var i = 0; i < allbuckets["price"].length; i++) {
        for (var j = i + 1; j < allbuckets["price"].length; j++) {
            if (allbuckets["price"][i].key == allbuckets["price"][j].key) {
                allbuckets["price"][i]["doc_count"] = allbuckets["price"][i]["doc_count"] + allbuckets["price"][j]["doc_count"];
                allbuckets["price"].splice(j, 1);
            }
        }
    }
    allbuckets["price"].pop()
    console.log("now buckets are:", allbuckets);

    return allbuckets;
}


//count attributes of subcategories
module.exports.countSubcategoryAttributes = function*(attributes, category) {
    console.log("category is :", category);
    console.log("attribute sare ", attributes);
    attributes.unshift("Brand","Price");
    var countQuery = {
        body: [{
            index: config.elastic.productIndexName,
            type: "product"
        }, {
            "query": {
                "match_phrase": {
                    "category.org": category
                }
            },
            "size": 0,
            "aggs": {}
        }]

    };
    var result = [];
    for (var i = 0; i < attributes.length; i++) {
        var x = attributes[i].replace(/\s/g, "").toLowerCase();
        console.log("x is ", x);
        if(x=="price") {
          var aggregation = x;
        } else if(x== "brand") {
          var aggregation = x + ".org";
        }
        else {
          var aggregation = "attribute." + x + ".org";  
        }
        if(x=="price") {
          countQuery.body[1]["aggs"] = {
              "count": {
                  "range": {
                      "field": "price",
                      "ranges": [{
                          "to": 5
                      }, {
                          "from": 5,
                          "to": 10
                      }, {
                          "from": 10,
                          "to": 15
                      }, {
                          "from": 15
                      }]
                  }
              }
          };
        }
        else {
        countQuery.body[1]["aggs"] = {
            "count": {
                "terms": {
                    "field": aggregation,
                    "size": 10000
                }
            }
        };
      }
      var response = yield Promise.promisify(es.msearch,es)(countQuery);
      var values = {}
      values["name"]  = attributes[i];
      values["values"] = response[0].responses[0].aggregations.count.buckets;
      result.push(values);
    }

    return result;
}
