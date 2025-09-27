require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const path = require('path');
const app = express();
const uri = process.env.MONGO_URL;
const PORT = process.env.PORT;
const engine = require('ejs-mate'); //EJS MATE
const methodOverride = require('method-override');
const ExpressError = require('./util/ExpressError');

const sessions = require('express-session');
const MongodbSession = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const localPassport = require('passport-local');
const User = require('./models/users');

const listingRoutes = require('./routes/listingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const filterRoutes = require('./routes/filterRoutes');
const {userRoutes} = require('./routes/userRoutes');

main().then(()=>console.log('connected to DB.'))
.catch((err)=>console.log(err));

async function main() {
  await mongoose.connect(uri);
}

app.use(sessions({
  store: MongodbSession.create({
    mongoUrl: uri,
    crypto:{
      secret:"mysomethingsecretcode"
    },
    touchAfter:24*3600,
  }),
  secret:'mysomethingsecretcode',
  resave: true, saveUninitialized : true,
  cookie:{
    expires:Date.now() + 7*24*60*60*1000,
    maxAge: 7*24*60*60*1000,
    httpOnly:true //for security purposes
  }
}));
app.use(flash());

//Mention passport after session! Why?
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localPassport(User.authenticate()));

// User middleware - MUST be after passport middleware to access req.user
app.use((req,res,next)=>{
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.failure =req.flash('failure');
  
  next();
});

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/views'));

app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));
app.use(methodOverride("method"));

app.engine('ejs', engine);
app.set('view engine', 'ejs');


app.use('/listings', filterRoutes);
app.use('/listings', listingRoutes);
app.use('/listings/:id/review', reviewRoutes);
app.use('/', userRoutes);

app.get('/',(req, res)=>{
  res.send('this is root');
});

app.use((req, res, next) => {
  next(new ExpressError(404, 'Page Not Found'));
});

app.use((err,req,res,next)=>{
  let {status=500,message="Some error has Occured on our server side!!"} = err;
  req.flash('failure', `Error ${status}: ${message}`);
  // Minimal loop guard: if already on /listings just send a plain text fallback (rare)
  if (req.originalUrl === '/listings') {
    return res.status(status).send(`Error ${status}: ${message}`);
  }
  res.redirect('/listings');
});

app.listen(PORT, ()=>{
  console.log(`listening at PORT ${PORT}`);
})
