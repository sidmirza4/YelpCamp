var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");   // it automatically takes the content of index.js


//   INDEX - show all campgrounds
router.get("/", function(req, res){	
	// Get all campgrounds from DB
	Campground.find({}, function(err,allCampgrounds){
		if(err){
			console.log(err);
		} else{
			res.render("campgrounds/index", {campgrounds: allCampgrounds});
		}
	});
});

//  NEW  -  show the form to user
router.get("/new" , middleware.isLoggedIn ,function(req, res){
	res.render("campgrounds/new.ejs");
});


//  CREATE - add new campground to DB
router.post("/" , middleware.isLoggedIn, function(req, res){
	var name = req.body.name;
	var price = req.body.price;
	var image = req.body.image;
	var desc = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	}
	var newCampground = {name: name, price: price, image: image, description: desc, author: author};
	// create a new campground and save that to DB
	Campground.create(newCampground, function(err, newlyCreated){
		if(err){
			console.log(err);
		} else{
			// redirct back to campground
			res.redirect("/campgrounds");	
		}
	});
});

// SHOW - shows more info about campground
router.get("/:id", function(req, res){
	// find the campground with provided ID
	Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
		if(err){
			console.log(err);
		} else {
			// render show template with that campground
			res.render("campgrounds/show" , {campground: foundCampground});
		}
	});
});

// EDIT CAMPGROUND ROUTE

router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req,res){	
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err){
			req.flash("error", "Campground not found");
		} else{
			res.render("campgrounds/edit", {campground: foundCampground});
		}
		
	});
});

// UPDATE CAMPGROUN ROUTE

router.put("/:id", middleware.checkCampgroundOwnership, function(req,res){
	// find and update the correct campground
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
		if(err){
			res.redirect("/campgrounds");
		} else {
			req.flash('success', "Campground Editted Sucessfully")
			// redirect to show page of edited campground
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

// DESTROY CAMPGROUND ROUTE

router.delete("/:id", middleware.checkCampgroundOwnership, function(req,res){
	Campground.findByIdAndDelete(req.params.id, function(err){
		if(err){
			res.redirect("/campgrounds");
		} else {
			req.flash('error', "Campground Successfully Deleted!")
			res.redirect("/campgrounds");
		}
	});
});






module.exports = router;