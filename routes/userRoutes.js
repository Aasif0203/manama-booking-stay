const express = require('express');
const router = express.Router();
const User = require('../models/users');
const passport = require('passport');

// signup 
router.get('/signup', (req, res) => {
	res.render('listing/signup');
});
router.post('/signup', async (req,res,next)=>{
  try{
    let {username,email,password} = req.body;
    let newUser = new User({username:username , email:email});
    const registeredUser = await User.register(newUser,password);
    // Automatically login as well
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash('success', `Signed-up succussfully! Welcome, ${username} !! `);
      res.redirect('/listings');
    });
  }catch(e){
    res.status(400);
    res.locals.failure = [e.message || 'Signup failed. Please try again.'];
    return res.render('listing/signup');
  }
});

// Login 
router.get('/login',(req,res)=>{
  res.render('listing/login');
});

router.post('/login', 
  // Add specific failure message - failureFlash alone uses generic message
  passport.authenticate('local', { 
    failureRedirect: '/login',
    failureFlash: 'Invalid username or password. Please try again.'
  }),
  (req, res) => {
    req.flash('success',`Hola ${req.body.username}! Welcome back to Manama!`);
    res.redirect('/listings');
  }
);

// Log-out
router.get('/logout',async (req,res)=>{
  req.logout((err)=>{
    if(err) return next(err);

    req.flash('success','User Logged-Out successfully. ');
    res.redirect('/listings');
  })
})

//middleware
const isLoggedin = (req,res,next)=>{
  // console.log(req.user);
  if(!req.isAuthenticated()){
    req.flash('failure','You must be logged-in');
    return res.redirect('/login');
  }
  next();
}

module.exports = {
  userRoutes : router,
  isLoggedin : isLoggedin
}

