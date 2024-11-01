/*const cloudinary = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    folder: 'YelpCamp',
    allowedFormats: ['jpeg', 'png', 'jpg', 'jfif']
});

module.exports = {
    cloudinary,
    storage
}*/

const cloudinary = require('cloudinary').v2; // Note the '.v2' here
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary using the CLOUDINARY_URL from environment variables
cloudinary.config(); // This automatically uses process.env.CLOUDINARY_URL

const storage = new CloudinaryStorage({
  cloudinary,
  //cloudinary: cloudinary,
  params: {
    folder: 'YelpCamp',
    allowed_formats: ['jpeg', 'png', 'jpg', 'jfif'],
  },
});

module.exports = {
  cloudinary,
  storage,
};
