const mongoose=require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const ListingSchema = new Schema({
  title:{
    type:String,
    required:true
  },
  description:{
    type:String,
    required:true
  },
  price:{
    type: Number,
    required:true,
    min:89,
  },
  image: {
    filename: {
      type: String,
      default: "listingimage"
    },
    url: {
      type: String,
      default: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1vdW50YWlufGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60"
    }
  },
  location:{
    type:String,
    required:true
  },
  sharingRoom: {
    type: Boolean,
    default: false
  },
  sharingFeatures: {
    sleep_schedule: {
      type: String,
      enum: ["early", "normal", "night_owl", "flexible"]
    },
    gender_preference: {
      type: String,
      enum: ["no_preference", "male", "female", "nonbinary"],
      default: "no_preference"
    },
    languages: [String],
    others: {
      type: String // User can manually list more needs
    }
  },
  country:{
    type:String,
    required:true
  },
  reviews:[
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    }
  ]
});

ListingSchema.post('findOneAndDelete', async (listing)=>{
  await Review.deleteMany({_id:{$in : listing.reviews}});
})

const Listing = mongoose.model("Listing" ,ListingSchema);
module.exports = Listing;