const  cloudinary  = require('cloudinary').v2;
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const Campground = require('../models/campground');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});




module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.renderEditForm = async (req, res) => {
  const campgrounds = await Campground.find();  // Fetch all campgrounds from the database
  res.render('campgrounds/edit', { campgrounds });  // Pass campgrounds to the view
};

module.exports.createCampground = async (req, res, next) => {
  try {
      // Ensure location is being passed and log for debugging
      console.log(req.body.campground.location);

      const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
      }).send();

      // Check if any features were returned
      if (geoData.body.features.length === 0) {
          console.log("No results found for the location.");
          return res.send("No results found for the location.");
      }

      const campground = new Campground(req.body.campground);
      campground.geometry = geoData.body.features[0].geometry;

      // Check the images received from Cloudinary
      console.log(req.files); // Log the uploaded files to ensure they are being passed

      // Map the images to the `images` array in the proper format
      campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
      
      campground.author = req.user._id;
      
      // Save the campground with images populated
      await campground.save();

      console.log(campground);  // Log the campground to confirm that images are saved
      req.flash('success', 'Successfully made a new campground!');
      res.redirect(`/campgrounds/${campground._id}`);
      
  } catch (err) {
      next(err);
  }
};



/*module.exports.createCampground = async (req, res, next) => {
  try {
      // Ensure the location is being passed and log it for debugging
      console.log(req.body.campground.location);
      
      const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location, // Ensure the location is passed in the body
        limit: 1
      }).send();

      // Check if any features were returned
      if (geoData.body.features.length === 0) {
          console.log("No results found for the location.");
          return res.send("No results found for the location.");
      }

       // Log the results

      
      const campground = new Campground(req.body.campground);
      campground.geometry = geoData.body.features[0].geometry;
      campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
      campground.author = req.user._id;
      await campground.save();
      console.log(campground);
      req.flash('success', 'Successfully made a new campground!');
      res.redirect(`/campgrounds/${campground._id}`);
      
  } catch (err) {
      // If an error occurs, pass it to the next error-handling middleware
      next(err);
  }
};*/




module.exports.showCampground = async(req, res) => {
    const campground = await Campground.findById(req.params.id)
      .populate({
        path: 'reviews',
        populate: { path: 'author' } // Ensure author is populated
      })
      .populate('author');
    
    if (!campground) {
      req.flash('error', 'Cannot find the campground!');
      return res.redirect('/campgrounds');
    }
    
    res.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
      req.flash('error', 'Cannot find that campground!');
      return res.redirect('/campgrounds');
  }
  res.render('campgrounds/edit', { campground });
};


module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  console.log(req.body);  // Debugging - Log the request body

  // Find the campground by ID
  const campground = await Campground.findById(id);

  // Handle image deletion
  if (req.body.deleteImages && req.body.deleteImages.length) {
    for (let filename of req.body.deleteImages) {
      // Delete image from Cloudinary
      await cloudinary.uploader.destroy(filename);
    }
    // Remove image reference from MongoDB
    await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
  }

  // Handle new images
  if (req.files && req.files.length > 0) {
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs); // Append new images to the existing array
  }

  // Update other campground fields if necessary
  campground.title = req.body.campground.title;
  campground.location = req.body.campground.location;
  campground.description = req.body.campground.description;
  campground.price = req.body.campground.price;

  // Save the updated campground
  await campground.save();

  // Flash success message and redirect to the campground's page
  req.flash('success', 'Successfully updated campground!');
  res.redirect(`/campgrounds/${id}`);
};



/*module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  console.log(req.body);

  // Find the campground by ID
  const campground = await Campground.findById(id);
  
  // Handle image deletion
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      // Delete image from Cloudinary
      await cloudinary.uploader.destroy(filename);
    }
    // Remove image reference from MongoDB
    await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    console.log(campground);
  }

  // Handle new images
  const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
  campground.images.push(...imgs);
  await campground.save();

  req.flash('success', 'Successfully updated campground!');
  res.redirect(`/campgrounds/${id}`);
};*/



 




module.exports.deleteCampground = async (req, res) => {
    
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground.')
    res.redirect('/campgrounds');
  }


  