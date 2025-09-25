const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const ExpressError = require('../util/ExpressError');
const {isLoggedin} = require('./userRoutes');


router.post('/search', async (req, res) => {
  try {
    const {searchTerm} = req.body;
    if (!searchTerm) {
      return res.redirect('/listings');
    }
    
    // Create a search query that matches title OR location
    // Using case-insensitive regex for better matching
    const listings = await Listing.find({
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { location: { $regex: searchTerm, $options: 'i' } },
        { country: { $regex: searchTerm, $options: 'i' } }
      ]
    }).populate('owner');
    if(!listings || listings.length===0){
      req.flash('failure', 'No such listing found!');
      return res.redirect('/listings');
    }
    
    req.flash('success',`Search results for "${searchTerm}"`);
    res.render('../views/listing/index.ejs',{listings});
    
  } catch (error) {
    req.flash('failure', 'Error performing search');
    res.redirect('/listings');
  }
});

router
.route('/')
.get(async (req,res,next)=>{
  try{
    const list = await Listing.find({});
    res.render('../views/listing/index.ejs',{listings : list});
  }catch(err){
    next(err);
  }
})
.post(isLoggedin, async (req,res,next)=>{
  try{
    if(!req.body.listing){
      return next(new ExpressError(400,"Listing data is missing!"));
      next(new ExpressError(400,"Invalid or missing listing data!"));
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