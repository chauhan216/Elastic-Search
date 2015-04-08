var mongoose = require('mongoose');
var dbConnection = require("./store_dbConnection.js");
var reviewSchema = new mongoose.Schema(
  {
  product_id: String,         //id of product (FK),
  creationtimestamp: Date,    //date_time iso
  score: Number,
  recommend: Boolean,
  review_text:String,        //"the best thing ever ...",
  useful_votes: Number,
  creator_id: String,        //FK of user_id,
  creator_nickname: String,
  creator_email: String,
  creator_location : {
    city: String, 
    state : String, 
    country : String
    }
  }
)
reviewCollection = mongoose.model('review', reviewSchema);
module.exports.reviewCollection = dbConnection.db.model("review"); 