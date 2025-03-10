// ========================================================================

// COMMENTS ROUTES

// ========================================================================

var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

router.get("/new", middleware.isLoggedIn ,function(req,res){
	// find campground by id
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err)
		} else {
			res.render("comments/new", {campground: campground});
		}
	});
});

router.post("/", middleware.isLoggedIn , function(req,res){
	// lookup comment using ID
	Campground.findById(req.params.id, function(err,campground){
		if(err){
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			// create new comments
			Comment.create(req.body.comment, function(err, comment){
				if(err){
					req.flash("error", "Something Went Wrong!");
					console.log(err);
				} else {
					// add username and id to comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					// save comment
					comment.save();
					campground.comments.push(comment);
					campground.save();
					req.flash("success", "Comment Added Successfully..")
					// redirect back to show page
					res.redirect("/campgrounds/" + campground._id);
				}
			});
		}
	});
});

// Comment Edit Route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req,res){
	Comment.findById(req.params.comment_id, function(err, foundComment){
		if(err){
			res.redirect("back");
		} else {
			res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
		}
	});	
});

// Comment Update Route
router.put("/:comment_id", middleware.checkCommentOwnership ,function(req,res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment , function(err, updatedComment){
		if(err){
			res.redirect("back");
		} else {
			req.flash("success", "Comment Editted Successfully")
			res.redirect("/campgrounds/" + req.params.id)
		}
	});
});

// Comment Destroy Route

router.delete("/:comment_id", middleware.checkCommentOwnership ,function(req, res){
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
		if(err){
			res.redirect("back");
		} else{
			req.flash("success", "Comment Deleted");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});



module.exports = router;