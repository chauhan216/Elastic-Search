"use strict"
var config = {
	mongo: {
		url: 'mongodb://localhost:27017',
		options: {} // can be changed later
	},
  elastic:{
    url: 'http://localhost:9200',
    productIndexName: 'elastictestproducts',
    categoryIndexName : 'elastictestcategory'
  },	
};

exports = module.exports = config;