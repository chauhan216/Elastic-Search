var testElastic = angular.module("testElastic", ['ui.router']);

testElastic.config(function($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('home', {
            url: "/test",
            templateUrl: "test.html",
            controller: "testController"
        });
    $urlRouterProvider.otherwise('/test');
});

testElastic.controller("testController", function($scope, $http, $timeout, $q) {


    $scope.brandQuery = [];

    $scope.result = [];

    $scope.brandArray = [];
    $scope.selectedBrands = [];
    var page = 1,
        per_page = 10;
    var query = {};
    console.log("inside the test elastic search", $scope.textToSearch);
    $http.get("/categories", {})
        .success(function(data) {
            console.log("all categories are:", data);
            $scope.menuList = data;

        });

    $scope.getProducts = function(querySearch) {
        $scope.productFound = true;
        var defer = $q.defer();
        $http.post("/search", querySearch)
            .success(function(data) {
                console.log("result is ", data);
                $scope.productResult = data.product;
                console.log("result is ...", $scope.productResult);
                console.log("total hits are ..", data.total);
                $scope.total = data.total;
                if (data.total > per_page) {
                    $scope.nextShow = true;
                } else {
                    $scope.nextShow = false;
                }
                if ($scope.productResult.length > 0) {

                    $scope.noResult = false;
                } else {

                    $scope.noResult = true;
                }




                // for (var i in $scope.productResult) {
                //     console.log("...", $scope.productResult[i][0].details.brand);
                //     $scope.brandArray.push($scope.productResult[i][0].details.brand);
                // }
                // $scope.brandArray = _.uniq($scope.brandArray);
                // console.log("...brand is ", $scope.brandArray);
                defer.resolve(data);
            }).error(function(data) {
                defer.reject(data);
            });
        return defer.promise;
    }



    $scope.getCategoryProducts = function(querySearch) {
        $scope.productFound = true;
        var defer = $q.defer();
        $http.post("/search/category", querySearch)
            .success(function(data) {
                console.log("result is ", data);
                $scope.productResult = data.product;
                $scope.attributes = data.attributes;
                console.log("attribues are", $scope.attributes);
                console.log("result is ", $scope.productResult);
                console.log("total hits are ..", data.total);

                $scope.total = data.total;
                if ($scope.productResult.length > 0) {
                    
                    $scope.noResult = false;
                } else {

                    $scope.noResult = true;
                }
                defer.resolve(data);
            }).error(function(data) {
                defer.reject(data);
            });
        return defer.promise;
    }
    $scope.searchProduct = function() {
        $scope.nameFound = false;
        console.log("now the model is :", $scope.textToSearch);

        page = 1;
        $scope.resultShow = $scope.textToSearch;
        query = {
            "query": $scope.textToSearch,
            "page": page,
            "per_page": per_page
        }
        $scope.getProducts(query)
            .then(function(data) {
                $scope.textToSearch = "";
            })


    };
    $scope.searchProductName = function() {
        if ($scope.textToSearch == "") {
            $scope.nameFound = false;
        } else {
            query = {
                "query": $scope.textToSearch,
                "autoComplete": true
            }
            $http.post("/search", query)
                .success(function(data) {
                    console.log("result is ", data);
                    $scope.nameResult = data.product;
                    $scope.total = data.total;
                    console.log("name result is ", $scope.nameResult);
                    if ($scope.nameResult.length > 0) {
                        $scope.nameFound = true;
                        $scope.noResult = false;
                    } else {
                        $scope.nameFound = false;
                        // $scope.noResult = true;
                    }

                });
        }
    };
    $scope.selectedShow = function(thisProduct) {
        console.log("selected...", thisProduct);
        $scope.resultShow = thisProduct.name;
        $scope.productResult = [thisProduct];
        $scope.selectedShow = false;
        console.log("productResult is ..", $scope.productResult);
        $scope.productResult.forEach(function(data) {
            console.log("category will be : ", data.category);
            $scope.menuList.forEach(function(value) {
                if (value.name == data.category) {
                    for (var i = 0; i < $scope.menuList.length; i++) {
                        var j = i + 2;
                        if ($("ul.categoryList li:nth-child(" + j + ")").hasClass("fontBold")) {
                            $("ul.categoryList li:nth-child(" + j + ")").removeClass("fontBold");
                        }
                    }
                    // index = index + 2;
                    // $("ul.categoryList li:nth-child(" + index + ")").addClass("fontBold");
                    var x = $scope.menuList.indexOf(value);
                    index = x + 2;
                    $("ul.categoryList li:nth-child(" + index + ")").addClass("fontBold");
                    var foundCategory = value;
                    console.log("value joooooo", foundCategory);
                    $scope.menuList[x]["display"] = true;

                    $scope.showSubCategory(foundCategory.category_code, false)
                        .then(function(data1) {
                            console.log("promise data is :", $scope.sideSubCategoryList);
                            $scope.sideSubCategoryList.forEach(function(subValue) {
                                console.log("sub value is ", subValue.name.replace(/ /g, ""))
                                if (subValue.name.replace(/ /g, '') == data.subcategory) {
                                    console.log("found");
                                    for (var i = 0; i < $scope.sideSubCategoryList.length; i++) {
                                        $("#subList" + i).css("font-weight", "normal");
                                    }
                                    var subindex = $scope.sideSubCategoryList.indexOf(subValue);


                                }
                            });

                        });;



                }
            });

        });
        $scope.nameFound = false;
        $scope.total = 1;
        $scope.productFound = true;


    };
    // $scope.getCategoryAttribute = function(query) {
    //     console.log("query for category is :", query);
    //     $http.post("/search/category", {
    //             "query": query
    //         })
    //         .success(function(data) {
    //             console.log("dtaa is ..", data);
    //             $scope.allCategoryAttributes = [];
    //             data.forEach(function(e) {
    //                 var newAttribute = {};
    //                 newAttribute["name"] = Object.keys(e)[0];
    //                 newAttribute["value"] = e[Object.keys(e)[0]]
    //                 $scope.allCategoryAttributes.push(newAttribute);
    //             })
    //             console.log("all attriuts are :", $scope.allCategoryAttributes);
    //             $scope.attributeList = true;
    //         })
    // };
    $scope.select = function(thisCategory, index) {
        console.log("....", index);
        $scope.index = index;
        $scope.subresult = "";
        $scope.selectedBrands = [];
        console.log("brand query is :", $scope.brandQuery);
        $scope.menuList.forEach(function(data) {
            if ($scope.menuList[index].name != data.name) {
                if (data["display"] == true) {
                    data["display"] = false;
                }
            }

        });
        if (!$scope.menuList[index]["display"]) {
            $scope.menuList[index]["display"] = true;
        } else if ($scope.menuList[index]["display"]) {
            $scope.menuList[index]["display"] = false;
        }


        $scope.showSubCategory(thisCategory.category_code, true);
        $scope.productFound = true;
        console.log(thisCategory);
        $scope.selectedAttributes = [];
        console.log("element is :..", $("ul.categoryList li:nth-child(" + index + 2 + ")"));
        // $scope.categoryList = "fontBold";
        for (var i = 0; i < $scope.menuList.length; i++) {
            var j = i + 2;
            // console.log(j);
            if ($("ul.categoryList li:nth-child(" + j + ")").hasClass("fontBold")) {
                $("ul.categoryList li:nth-child(" + j + ")").removeClass("fontBold");
            }
        }
        index = index + 2;
        $("ul.categoryList li:nth-child(" + index + ")").addClass("fontBold");
        page = 1;
        // $scope.brandArray = [];
        console.log(thisCategory.name.substr(0, thisCategory.name.indexOf(" ")));
        if (thisCategory.name.indexOf(" ") != -1) {
            $scope.categoryMatch = thisCategory.name.substr(0, thisCategory.name.indexOf(" ")).toLowerCase()
        } else {
            $scope.categoryMatch = thisCategory.name.toLowerCase();
        }

        $scope.getCategoryProducts({
            "category": thisCategory.name
        });
        var categoryQuery = thisCategory;
        $scope.resultShow = thisCategory;
        $scope.brandList = true;
        $timeout(function(){

          $(".faded input").attr("disabled",true);
          $(".faded input").css("cursor","default");
        },400);
    };
    $scope.convertCategory = function(completeName) {
        var value = completeName.replace(/\W/g, " ");
        if (value.indexOf(" ") > 0)
            value = value.substr(0, value.indexOf(" ")).toLowerCase();
        else
            value = value.toLowerCase();
        return value;
    };

    $scope.nextPage = function() {
        page = page + per_page;
        query = {
            "query": $scope.resultShow.name,
            "page": page,
            "per_page": per_page
        };
        $scope.getProducts(query);


    };

    $scope.change = function(value, index, selected) {

        console.log("the things are .." + value + "and   " + index + "  " + selected);
        if (selected) {
            $scope.selectedBrands.push(value.toLowerCase());
        } else {
            $scope.selectedBrands.splice($scope.selectedBrands.indexOf(value.toLowerCase()), 1);
        }
        console.log("hello...", $scope.selectedBrands);
        $scope.brandQuery = [];
        for (var i in $scope.selectedBrands) {
            $scope.selectedBrands[i] = $scope.selectedBrands[i].replace(/\W/g, " ");

            if ($scope.selectedBrands[i].indexOf(" ") != -1)
                $scope.brandQuery.push($scope.selectedBrands[i].substr(0, $scope.selectedBrands[i].indexOf(" ")));
            else
                $scope.brandQuery.push($scope.selectedBrands[i]);
        }
        console.log("now the wuery is ..", $scope.brandQuery);
        if ($scope.brandQuery.length == 0) {
            console.log("length is 0 ", $scope.resultShow);
            $scope.select($scope.resultShow, $scope.index);
            $scope.menuList[$scope.index]["display"] = true;

        } else {
            var categoryIs = $scope.convertCategory($scope.resultShow.name);
            console.log("no w selected category is :", categoryIs);
            query = {
                "query": {
                    "filtered": {
                        "filter": {
                            "bool": {
                                "must": [{
                                    "terms": {
                                        "brand": $scope.brandQuery
                                    }

                                }]
                            },

                        }
                    }

                },
                "page": page,
                "per_page": per_page
            };
        }
        $scope.getProducts(query)
            .then(function(data) {
                var show = [];
                $scope.sideSubCategoryList.forEach(function(value) {
                    for (var i = 0; i < $scope.productResult.length; i++) {
                        if (value.name == $scope.productResult[i].category) {
                            show.push($scope.productResult[i]);
                        }
                    }
                })
                console.log("sow is ", show);
                $scope.productResult = show;
            })

    };
    $scope.mouseleave = function() {

        $scope.subCategoryShow = false;
    }
    $scope.showSubCategory = function(category_name, value) {
        console.log("name is :", category_name);
        // $(".subCategory").
        var deferred = $q.defer();
        $http.get("/category/" + category_name, {})
            .success(function(data) {
                console.log("all sub categories are:", data);
                $scope.subCategoryList = data.subcategories;
                $scope.sideSubCategoryList = data.subcategories;
                $scope.brandArray = [];
                $scope.brandArray = data.countBrand;
                $scope.priceRange = data.priceRange;

                $scope.attributeList = true;
                if ($scope.subCategoryList.length > 0 && value == true)
                    $scope.subCategoryShow = true;
                else
                    $scope.subCategoryShow = false;
                deferred.resolve(data);
            }).error(function(data) {
                deferred.reject(data);
            });

        return deferred.promise;

    };
    $scope.removeSpace = function(value) {
        var x = value[Object.keys(value)[0]]
        x.forEach(function(data) {
            if (data.indexOf(" ") > 0)
                x[x.indexOf(data)] = data.substr(0, data.indexOf(" "));

        });
        value[Object.keys(value)[0]] = x;
        return value;
    }
    $scope.selectedAttributes = [];
    $scope.selectedAttribute = function(attribute, value, selected) {
        var attributeSelected = {};


        attributeSelected[attribute] = [value.toLowerCase()];

        if (selected) {
            var push = true;
            // $scope.selectedAttributes.push(attributeSelected);
            $scope.selectedAttributes.forEach(function(data) {
                if (Object.keys(data)[0] == attribute) {
                    data[attribute].push(attributeSelected[attribute][0]);
                    push = false;
                    // break;
                }


            });
            if (push) {

                $scope.selectedAttributes.push(attributeSelected);

            }

        } else {
            var splice = true;
            // $scope.selectedAttributes.push(attributeSelected);
            $scope.selectedAttributes.forEach(function(data) {
                if (Object.keys(data)[0] == attribute) {
                    data[attribute].splice(data[attribute].indexOf(attributeSelected[attribute]), 1);
                    splice = false;
                    // break;
                }
                if (data[Object.keys(data)[0]].length == 0) {
                    $scope.selectedAttributes.splice($scope.selectedAttributes.indexOf(data), 1);
                }


            });
            if (splice) {

                $scope.selectedAttributes.splice($scope.selectedAttributes.indexOf(attributeSelected), 1);

            }


        }
        console.log("attributes for query are :", $scope.selectedAttributes);
        var mustQuery = [];
        var shouldQuery = [];
        $scope.selectedAttributes.forEach(function(data) {
            var mustQueryObject = {};

            mustQueryObject["terms"] = $scope.removeSpace(data);
            mustQuery.push(mustQueryObject);
        });
        var categoryIs = $scope.convertCategory($scope.resultShow.name);

        mustQuery.push({
            "term": {
                "category": categoryIs
            }
        })
        console.log("mustQuery is :", mustQuery);
        query = {
            "query": {
                "filtered": {
                    "filter": {
                        "bool": {
                            "must": mustQuery

                        },

                    }
                }

            },
            "page": page,
            "per_page": per_page
        };
        console.log("query is :", query);
        $scope.getProducts(query);


    };
    $scope.getSingle = function(value) {
        value = value.replace(/\W/g, " ").toLowerCase();
        if (value.indexOf(" ") != -1)
            return value.substr(0, value.indexOf(" "));
        else
            return value;
    };

    $scope.filterSubCategory = function(category, subCategory, index) {
        $scope.subresult = subCategory;
        $scope.getCategoryProducts({
            "subCategory": subCategory
        });
        $scope.attributeList = false;
        $scope.brandList = false;
        $timeout(function(){
          $(".faded input").attr("disabled",true);
          $(".faded input").css("cursor","default");
        },400);
    };

    $scope.range = [];
    $scope.selectedPrice = function(price, value) {
        // console.log("price .."+price +'  value si  ..'+value);
        var from = price.from || 0;
        var to = price.to || 100000;
        if(value) {
          $scope.range.push(from);
          $scope.range.push(to);
          
        } else
        {
          $scope.range.splice($scope.range.indexOf(from),1);
          $scope.range.splice($scope.range.indexOf(to),1); 
        }
        // $scope.range = _.uniq($scope.range);
       
        console.log("max is  is :",_.max($scope.range));
        console.log("form is", from);
        console.log("to is ", to);
        var catName = [];
        $scope.sideSubCategoryList.forEach(function(data) {
          catName.push(data.name);
        });
        console.log("terms are ", catName)
        if($scope.range.length>0) 
        {
          var max = _.max($scope.range);
          var min = _.min($scope.range);
          query = {
            "query": {
                "filtered": {
                    "filter": {
                        "bool": {
                            "must": [{
                                "terms": {
                                    "category.org": catName
                                }
                            }, {
                                "range": {
                                    "price": {
                                        "gte": min,
                                        "lte":max

                                    }
                                }
                            }]
                        }

                    }
                }
            },
            "page": page,
            "per_page": per_page
        };
        console.log("query is :",query);
        $scope.getProducts(query);
        }
        else
        {
          $scope.select($scope.resultShow,$scope.index);
        }
        

    }

    $(document).keypress(function(event) {
        if (event.which == 13) {
            $scope.nameFound = false;
            $scope.searchProduct();
        }
    });

});
