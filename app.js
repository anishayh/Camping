





/*if (process.env.NODE_ENV !== "production")  {
  require('dotenv').config();
}*/

require('dotenv').config();

const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const bp = require("body-parser");
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const Campground = require('./models/campground');
const mongoSanitize = require('express-mongo-sanitize'); // Make sure to import the Campground model
const MongoStore = require('connect-mongo');
const usersRoutes = require('./routes/users');
const campgroundRoutes  = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const helmet = require('helmet');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';





async function main() {
  await mongoose.connect(dbUrl) // Use the dbUrl variable
    .then(() => {
      console.log("CONNECTION OPEN!!");
    })
    .catch(err => {
      console.log("OH NO ERROR!!!");
      console.log(err);
    });
}
main();


const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize())


const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
      secret
  }
});

store.on("error", function(e){
    console.log("SESSION STORE ERROR", e)
})



const sessionConfig = {
  store,
  name: 'session',
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    
    expire: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}
app.use(session(sessionConfig))
app.use(flash());
app.use(helmet({contentSecurityPolicy: false}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})





app.use('/', usersRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
  res.render('home');
});

// Catch-all route for undefined routes
app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
})

// Error handler
app.use((err, req, res, next) => {
  console.log(err);  // Log the full error for debugging
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Oh No, Something Went Wrong!';
  res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
  console.log('Serving on port 3000');
}); 


