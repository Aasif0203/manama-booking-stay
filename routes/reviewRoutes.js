const express = require('express');
const router = express.Router({mergeParams:true});
const Listing = require('../models/listing');
const Review = require('../models/review');
const ExpressError = require('../util/ExpressError');


router.post('/', async (req,res,next)=>{
  try{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${req.params.id}`)
  }catch(err){
    next(err);
  }
})
// Review Deletion
router.delete('/:reviewId', async (req,res,next) =>{
  try{
    let {id,reviewId} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull : {reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
  }catch(err){
    next(err);
  }
})

module.exports = router;