var testElastic = angular.module("testElastic", ['ui.router']);

testElastic.config(function($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('home', {
            url: "/test",
            templateUrl: "x.html",
            controller: "testController"
        });
    $urlRouterProvider.otherwise('/test');
});

testElastic.controller("testController", function($scope, $http) {


    var brandQuery = [];

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
        $http.post("/search", querySearch)
            .success(function(data) {
                console.log("result is ", data);
                $scope.productResult = data.product;
                console.log("result is ", $scope.productResult);
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




                for (var i in $scope.productResult) {
                    console.log("...", $scope.productResult[i][0].details.brand);
                    $scope.brandArray.push($scope.productResult[i][0].details.brand);
                }
                $scope.brandArray = _.uniq($scope.brandArray);
                console.log("...brand is ", $scope.brandArray);

            });
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
        $scope.getProducts(query);
        $scope.textToSearch = "";
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
        $scope.resultShow = thisProduct[0].name;
        $scope.productResult = [thisProduct];
        console.log("productResult is ..", $scope.productResult);
        $scope.nameFound = false;
        $scope.productFound = true;


    };
    $scope.getCategoryAttribute = function(query) {
        console.log("query for category is :", query);
        $http.post("/search/category", {
                "query": query
            })
            .success(function(data) {
                console.log("dtaa is ..", data);
                $scope.allCategoryAttributes = [];
                data.forEach(function(e) {
                    var newAttribute = {};
                    newAttribute["name"] = Object.keys(e)[0];
                    newAttribute["value"] = e[Object.keys(e)[0]]
                    $scope.allCategoryAttributes.push(newAttribute);
                })
                console.log("all attriuts are :", $scope.allCategoryAttributes);
                $scope.attributeList = true;
            })
    };
    $scope.select = function(thisCategory, index) {
        console.log("....", index);
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
        $scope.brandArray = [];
        console.log(thisCategory.name.substr(0, thisCategory.name.indexOf(" ")));
        if (thisCategory.name.indexOf(" ") != -1) {
            var categoryMatch = thisCategory.name.substr(0, thisCategory.name.indexOf(" ")).toLowerCase()
        } else {
            var categoryMatch = thisCategory.name.toLowerCase();
        }
        query = {
            "query": {
                "filtered": {
                    "filter": {
                        "term": {
                            "category": categoryMatch
                        }
                    }
                }

            },
            "page": page,
            "per_page": per_page
        };
        console.log("query is ", query);
        $scope.getProducts(query);
        var categoryQuery = thisCategory;
        $scope.getCategoryAttribute(categoryQuery);
        $scope.resultShow = thisCategory.name;
        $scope.brandList = true;
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
            "query": $scope.resultShow,
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
        brandQuery = [];
        for (var i in $scope.selectedBrands) {
            $scope.selectedBrands[i] = $scope.selectedBrands[i].replace(/\W/g, " ");

            if ($scope.selectedBrands[i].indexOf(" ") != -1)
                brandQuery.push($scope.selectedBrands[i].substr(0, $scope.selectedBrands[i].indexOf(" ")));
            else
                brandQuery.push($scope.selectedBrands[i]);
        }
        console.log("now the wuery is ..", brandQuery);
        if (brandQuery.length == 0) {
            console.log("length is 0 ", $scope.resultShow);
            query = {
                "query": $scope.resultShow,
                "page": page,
                "per_page": per_page
            };

        } else {
            var categoryIs = $scope.convertCategory($scope.resultShow);
            console.log("no w selected category is :", categoryIs);
            query = {
                "query": {
                    "filtered": {
                        "filter": {
                            "bool": {
                                "must": [{
                                    "terms": {
                                        "brand": brandQuery
                                    }
                                }, {
                                    "term": {
                                        "category": categoryIs
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
        $scope.getProducts(query);

    };
    $scope.mouseleave = function() {

        $scope.subCategoryShow = false;
    }
    $scope.showSubCategory = function(category_name) {
        console.log("name is :", category_name);
        // $(".subCategory").
        $http.get("/category/" + category_name, {})
            .success(function(data) {
                console.log("all sub categories are:", data);
                $scope.subCategoryList = data;
                if ($scope.subCategoryList.length > 0)
                    $scope.subCategoryShow = true;
                else
                    $scope.subCategoryShow = false;

            });



    };
    $scope.removeSpace = function(value) {
        var x = value[Object.keys(value)[0]]
        x.forEach(function(data) {
        if (data.indexOf(" ") > 0)
        x[x.indexOf(data)] =  data.substr(0, data.indexOf(" "));

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
                if(Object.keys(data)[0] == attribute) {
                    data[attribute].push(attributeSelected[attribute][0]);
                    push = false;
                    // break;
                }
                

            });
            if(push) {

                    $scope.selectedAttributes.push(attributeSelected);
                
            }
            
        } else {
            var splice = true;
            // $scope.selectedAttributes.push(attributeSelected);
            $scope.selectedAttributes.forEach(function(data) {
                if(Object.keys(data)[0] == attribute) {
                    data[attribute].splice(data[attribute].indexOf(attributeSelected[attribute]),1);
                    splice = false;
                    // break;
                }
                if(data[Object.keys(data)[0]].length == 0) {
                     $scope.selectedAttributes.splice($scope.selectedAttributes.indexOf(data),1);
                }
                

            });
            if(splice) {

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
        var categoryIs = $scope.convertCategory($scope.resultShow);
        
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


    }

    $(document).keypress(function(event) {
        if (event.which == 13) {
            $scope.nameFound = false;
            $scope.searchProduct();
        }
    });

});
