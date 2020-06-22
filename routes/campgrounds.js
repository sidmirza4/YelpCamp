var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");   // it automatically takes the content of index.js


//   INDEX - show all campgrounds
router.get("/", function(req, res){
	var noMatch;
	if(req.query.search){
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Campground.find({name: regex}, function(err,allCampgrounds){
			if(err){
				console.log(err);
			} else{
				if(allCampgrounds.length < 1){
					noMatch = "No campground found, please try again..!"
				}
				res.render("campgrounds/index", {campgrounds: allCampgrounds, noMatch: noMatch});
			}
		});
	}
	else{
		// Get all campgrounds from DB
		Campground.find({}, function(err,allCampgrounds){
			if(err){
				console.log(err);
			} else{
				res.render("campgrounds/index", {campgrounds: allCampgrounds, noMatch: noMatch});
			}
		});
	}
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
	Campground.findById(req.params.id).populate("comments likes").exec(function(err,foundCampground){
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

// UPDATE CAMPGROUND ROUTE

router.put("/:id", middleware.checkCampgroundOwnership, function (req, res) {
    // find and update the correct campground
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            campground.name = req.body.campground.name;
            campground.description = req.body.campground.description;
            campground.image = req.body.campground.image;
			campground.price = req.body.campground.price;
            campground.save(function (err) {
                if (err) {
                    console.log(err);
                    res.redirect("/campgrounds");
                } else {
					req.flash('success', "Campground Successfully Updated");
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
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

// Campground Like Route
router.post("/:id/like", middleware.isLoggedIn, function (req, res) {
    Campground.findById(req.params.id, function (err, foundCampground) {
        if (err) {
            console.log(err);
            return res.redirect("/campgrounds");
        }

        // check if req.user._id exists in foundCampground.likes
        var foundUserLike = foundCampground.likes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (foundUserLike) {
            // user already liked, removing like
            foundCampground.likes.pull(req.user._id);
        } else {
            // adding the new user like
            foundCampground.likes.push(req.user);
        }

        foundCampground.save(function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/campgrounds");
            }
            return res.redirect("/campgrounds/" + foundCampground._id);
        });
    });
});


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};



module.exports = router;