const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const ExpressError = require('../util/ExpressError');
const {isLoggedin} = require('./userRoutes');

router.get('/',async (req,res,next)=>{
  try{
    const list= await Listing.find({});
    res.render('../views/listing/index.ejs',{listings : list});
  }catch(err){
    next(err);
  }
});

router.get('/new',isLoggedin, async (req,res,next) => {
  try{
    res.render('../views/listing/new.ejs');
  }catch(err){
    next(err);
  }
});

router.post('/',isLoggedin, async (req,res,next)=>{
  try{
    const newListing = new Listing(req.body.listing);
    if(!newListing){
      next(new ExpressError(400,"Listing doesn't exist !!"));
    }
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash('success', "New Listing created successfully !");
    res.redirect('/listings');
  }catch(err){
    next(err);
  }
  
});

//Review Submission


router.get('/:id', async (req,res,next) =>{
  try{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({
      path: 'reviews',
      populate:{
        path: 'author'
      }
    }).populate('owner');
    if(!listing){
      return next(new ExpressError(400,"Listing invalid !!"));
    }
    res.render("../views/listing/show.ejs" , {listing});
  }catch(err){
    next(err);
  }
})
router.get('/:id/edit', isLoggedin, async (req,res,next)=>{
  try{
    let listing = await Listing.findById(req.params.id);
    if(!listing){
      next(new ExpressError(400,"Give a proper listing"));
    }
    res.render("../views/listing/edit.ejs" , {listing});
  }catch(err){
    next(err);
  }
});
router.put('/:id',isLoggedin, async (req,res,next)=>{
  try{
    if(!req.params.id || !req.body.listing){
      return next(new ExpressError(400,"Give a proper listing"));
    }
    let currListing = await Listing.findById(req.params.id);
    if(!req.user._id.equals(currListing.owner._id)){
      req.flash('failure', 'You dont have the permission to Edit!');
      return res.redirect('/listings');
    }
    await Listing.findByIdAndUpdate(req.params.id, req.body.listing);
    res.redirect(`/listings/${req.params.id}`);
  } catch(err){
    next(err);
  }
})
router.delete('/:id', isLoggedin, async (req,res,next) =>{
  try{
    let currListing = await Listing.findById(req.params.id);
    if(!req.user._id.equals(currListing.owner._id)){
      req.flash('failure', 'You dont have the permission to Delete!');
      return res.redirect('/listings');
    }

    await Listing.findByIdAndDelete(req.params.id);
    req.flash('success','Listing deleted successfully!');
    res.redirect('/listings');
  }catch(err){
    next(err);
  }
})
module.exports = router;