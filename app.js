require('dotenv').config()

var express			= require("express"),
	app				= express(),
	bodyParser  	= require("body-parser"),
 	mongoose 		= require("mongoose"),
	moment			= require("moment"),
	passport		= require("passport"),
	flash			= require("connect-flash"),
	LocalStrategy 	= require("passport-local"),
	methodOverride	= require("method-override"),
	Campground  	= require("./models/campground"),
	Comment			= require("./models/comment"),
	User			= require("./models/user"),
	seedDB			= require("./seeds");

// requiring routes
var commentRoutes    = require("./routes/comments"),
    reviewRoutes     = require("./routes/reviews"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes      = require("./routes/index")

mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost:27017/yelp_camp_v16", {useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine" , "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

//console.log(__dirname);

//seedDB();			// seed the database

// PASSPORT CONFIGURATION

app.use(require("express-session")({
	secret: "I am Sid",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.moment  = moment;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.listen(3000, process.env.IP, function(){
	console.log("Server has started");
});