const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const ExpressError = require('../util/ExpressError');
const {isLoggedin} = require('./userRoutes');


router.get('/my-properties',isLoggedin,async (req,res,next)=>{
  try{
    // const id = req.user._id;
    const listings = await Listing.find({owner:req.user});
    res.render('../views/listing/index.ejs',{listings, Title: "My Properties" ,myproperty:true});
  }catch(err){
    next(err);
  }
});

router
.route('/')
.get(async (req,res,next)=>{
  try{
    const list = await Listing.find({}).populate('owner');
    res.render('../views/listing/index.ejs',{listings : list,Title:"All Property Listings", myproperty:false});
  }catch(err){
    next(err);
  }
})
.post(isLoggedin, async (req,res,next)=>{
  try{
    if(!req.body.listing){
      return next(new ExpressError(400,"Listing data is missing!"));
    }
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash('success', "New Listing created successfully !");
    res.redirect('/listings');
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

//Review Submission


router
.route('/:id')
.get(async (req,res,next) =>{
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
}).delete(isLoggedin, async (req,res,next) =>{
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
}).put(isLoggedin, async (req,res,next)=>{
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

module.exports = router;