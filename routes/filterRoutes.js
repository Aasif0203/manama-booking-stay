const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');


// Combined filter and search route (GET method)
router.get('/filter', async (req, res) => {
  try {
    const { searchTerm, maxPrice, sharing, gender, wifi, pool } = req.query;
    
    // Build the filter query object
    let filterQuery = {};
    
    // Add search term filter if provided
    if (searchTerm && searchTerm.trim() !== '') {
      filterQuery.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { location: { $regex: searchTerm, $options: 'i' } },
        { country: { $regex: searchTerm, $options: 'i' } }
      ];
    }
    
    // Add price filter if provided
    if (maxPrice) {
      filterQuery.price = { $lte: parseInt(maxPrice) };
    }
    
    // Add sharing filter if checked
    if (sharing === 'on') {
      filterQuery.sharingRoom = true;
      
      // Add gender preference if provided and sharing is checked
      if (gender && gender !== 'no_preference') {
        filterQuery['sharingFeatures.gender_preference'] = gender;
      }
    }
    
    // Add amenities filters
    if (wifi === 'on') {
      filterQuery.wifi = true;
    }
    
    if (pool === 'on') {
      filterQuery.pool = true;
    }
    
    // Execute the query
    const listings = await Listing.find(filterQuery);
    
    // Handle no results
    if(!listings || listings.length === 0){
      req.flash('failure', 'No listings match your criteria');
      return res.redirect('/listings');
    }
    
    // Build success message
    let successMsg = 'Filtered results';
    if (searchTerm && searchTerm.trim() !== '') {
      successMsg += ` for "${searchTerm}"`;
    }
    
    req.flash('success', successMsg);
    
    // Pass myproperty flag false since this is a search/filter result
    res.render('../views/listing/index.ejs', { listings,Title: 'All Property Listing', myproperty: false });
  } catch (err) {
    console.error(err);
    req.flash('failure', 'Error filtering listings');
    res.redirect('/listings');
  }
});

module.exports = router;