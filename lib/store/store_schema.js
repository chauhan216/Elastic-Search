var mongoose = require('mongoose');
var dbConnection = require("./store_dbConnection.js");
var storeSchema = new mongoose.Schema({
  store_id : String,
  store_code : String,
  name : String,
  creationtimestamp : Date,
  description : String,
  status : Boolean,
  subcategory_id : [String],  //will always hold the subcategory
  storeaddress :
    {
    addressLine1 : String,
    addressLine2 : String,
    addressLine3 : String,
    city : String,
    stateorprovince : String,
    country : String,
    postalcode : String
    },
  contact :
    {
    StoreEmail : String,
    phone1 :
      {
      phonename : String,
      phonenumber : String,
      },
    phone2 : 
      {
      phonename : String,
      phonenumber : String,
      },
    websitelink : String,      
    },    
  Assets : 
      {images : [String]
      },
  HoursofOperation : 
    {
    timezone: String,
    daysofoperaton :
      {
      Monday : 
        {
        open : Boolean,      
        timeopens  : String,
        timecloses : String,
        },
      Tuesday :
        {
        open : Boolean,      
        timeopens  : String,
        timecloses : String,
        },
      Wednesday :
        {
        open : Boolean,      
        timeopens  : String,
        timecloses : String,
        },
      Thursday :
        {
        open : Boolean,      
        timeopens  : String,
        timecloses : String,
        },
      Friday : 
        {
        open : Boolean,      
        timeopens  : String,
        timecloses : String,
        },
      Saturday :
        {
        open : Boolean,      
        timeopens  : String,
        timecloses : String,
        },
      Sunday :
        {
        open : Boolean,      
        timeopens  : String,
        timecloses : String,
        }
      }
    },

  ActiveCatalogID : String,
  CatalogHistory : [String]
  }
);
storeCollection = mongoose.model('store', storeSchema);
module.exports.storeCollection = dbConnection.db.model("store");
