const mongoose=require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');
const passportLocalMongoose = require('passport-local-mongoose');
const Listing = require('./listing');

const UserSchema = new Schema({
  email:{
    type:String,
    required:true
  }
});
UserSchema.plugin(passportLocalMongoose);

UserSchema.post('findOneAndDelete',async (user)=>{
  await Review.deleteMany({ author: user._id });
  await Listing.deleteMany({owner: user._id});
});

module.exports = mongoose.model('User',UserSchema);
