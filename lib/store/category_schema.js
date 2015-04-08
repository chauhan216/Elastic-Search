var mongoose = require('mongoose');
var dbConnection = require("./store_dbConnection.js");
var categorySchema = new mongoose.Schema(                     
  { 
  name : String,
  category_code : String,
  parent_category : String, // this value will be empty if category is parent catogery
  attributes : []
  							 
  }
)  

categoryCollection = mongoose.model('category', categorySchema);
module.exports.categoryCollection = dbConnection.db.model("category"); 
