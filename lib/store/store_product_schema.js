var mongoose = require('mongoose');
var dbConnection = require("./store_dbConnection.js");
var productSchema = new mongoose.Schema(                     
  { 
  product_id : String,
  product_code : String,
  name : String,
  description : String,
  category_code : [String], 
  category: String,
  subcategory:String, //will hold subcategory's code
  deliveryspecs : String,
  shippingspecs : String,
  returnsspecs : String,
  variations : 
    [{
    name : String,
    SKU : String,
    unitofmeasure:String,     //each/box/pack/dozen,...,
    Pricing:
      {
      regularPrice : Number,     
      offerPrice : Number,      
      offerPriceValidUpto : Date,   
      discountAmount : Number
      //We assume that only one offer can be there at a time
      },  
    Inventory: 
      {
      quantityavailable : Number,
      quantityreserve : Number,
      alert : Number,
      online : Boolean,
      instore : Boolean,
      },
    Assets:
      {
      imagelinks : [String],
      videolinks : [String],
      },
      attributes : 
      [{
        name: String,
        value: String
      }]    
    }],
  
  details: 
    {
    brand : String,
    manufacturer : String,
    dimensions : {lenght : Number, width : Number,depth : Number},
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




      



