const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const ExpressError = require('../util/ExpressError');

router.get('/',async (req,res)=>{
  try{
    const list= await Listing.find({});
    res.render('../views/listing/index.ejs',{listings : list});
  }catch(err){
    next(err);
  }
});

router.get('/new', async (req,res) => {
  try{
    res.render('../views/listing/new.ejs');
  }catch(err){
    next(err);
  }
});

router.post('/', async (req,res,next)=>{
  try{
    const newListing = new Listing(req.body.listing);
    if(!newListing){
      next(new ExpressError(400,"Listing invalid !!"));
    }
    await newListing.save();
    res.redirect('/listings');
  }catch(err){
    next(err);
  }
  
});

//Review Submission


router.get('/:id', async (req,res,next) =>{
  try{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate('reviews');
    if(!listing){
      next(new ExpressError(400,"Listing invalid !!"));
    }
    res.render("../views/listing/show.ejs" , {listing});
  }catch(err){
    next(err);
  }
})
router.get('/:id/edit', async (req,res,next)=>{
  try{
    let listing = await Listing.findById(req.params.id);
    if(!listing){
      next(new ExpressError(400,"Give a proper listing"));
    }
    res.render("../views/listing/edit.ejs" , {listing});
  }catch(err){
    next(err);
  }
})
router.put('/:id', async (req,res,next)=>{
  try{
    if(!req.params.id || !req.body.listing){
      next(new ExpressError(400,"Give a proper listing"));
    }
    await Listing.findByIdAndUpdate(req.params.id, req.body.listing);
    res.redirect(`/listings/${req.params.id}`);
  } catch(err){
    next(err);
  }
})
router.delete('/:id', async (req,res) =>{
  try{
    await Listing.findByIdAndDelete(req.params.id);
    res.redirect('/listings');
  }catch(err){
    next(err);
  }
})
module.exports = router;