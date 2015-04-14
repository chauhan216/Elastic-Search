var mongoose = require('mongoose');
var dbConnection = require("./store_dbConnection.js");
var productSchema = new mongoose.Schema(                     
  { 
  product_id : String,
  product_code : String,
  name : String,
  description : String,
  category: String, 
  subcategory : String,
  deliveryspecs : String,
  shippingspecs : String,
  returnsspecs : String,
  pricing:
    {
    regularPrice : Number,     
    offerPrice : Number,      
    offerPriceValidUpto : Date,   
    discountAmount : Number
    //We assume that only one offer can be there at a time
    },  
  inventory: 
    {
    quantityavailable : Number,
    quantityreserve : Number,
    alert : Number,
    online : Boolean,
    instore : Boolean,
    },
  assets:
    {
    imagelinks : [String],
    videolinks : [String],
    },
  attributes : 
    [{
      name: String,
      value: String
    }] ,   
  details: 
    {
    brand : String,
    manufacturer : String,
    dimensions : {length : Number, width : Number,depth : Number},
    weight : Number
    },
  overallrating : Number   // updated nightly from reviews collection         
  },{ strict: false }              
);
var userInfo = new mongoose.Schema ( {
    isActive: Boolean,
    balance: String,
    picture: String,
    age: Number,
    eyeColor: String,
    name: String,
    gender: String,
    company: String,
    email: String,
    phone: String,
    address: String,
    about: String,
    tags: Array,
    friends: [
        {
            name: String
        }
    ],
    favoriteFruit: String
}
);
productCollection  = mongoose.model('product', productSchema);
userCollection = mongoose.model("user",userInfo);
module.exports.userCollection = dbConnection.db.model("user");
module.exports.productCollection = dbConnection.db.model("product");




      



