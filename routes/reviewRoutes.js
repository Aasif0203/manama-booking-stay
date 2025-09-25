const express = require('express');
const router = express.Router({mergeParams:true});
const Listing = require('../models/listing');
const Review = require('../models/review');


router.post('/', async (req,res,next)=>{
  try{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash('success', 'Review created successfully!!');
    res.redirect(`/listings/${req.params.id}`)
  }catch(err){
    next(err);
  }
})
// Review Deletion
router.delete('/:reviewId', async (req,res,next) =>{
  try{
    let {id,reviewId} = req.params;
    let currReview = await Review.findById(reviewId);
    if(!currReview || !currReview.author || !currReview.author._id.equals(req.user._id)){
      req.flash('failure', 'You cannot delete this review!');
      return res.redirect(`/listings/${id}`);
    }

    await Listing.findByIdAndUpdate(id,{$pull : {reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review Deleted');
    res.redirect(`/listings/${id}`);
  }catch(err){
    next(err);
  }
})

module.exports = router;