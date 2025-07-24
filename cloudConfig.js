require("dotenv").config(); // Ensure this line is at the top of your entry point file

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Check if necessary environment variables are set
if (
  !process.env.CLOUD_NAME ||
  !process.env.API_KEY ||
  !process.env.API_SECRET
) {
  console.error("Missing Cloudinary environment variables.");
  process.exit(1); // Exit the app if variables are missing
}

// Configure Cloudinary with your environment variables
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Set up the CloudinaryStorage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Category_img", // Set your Cloudinary folder
    allowedFormats: ["png", "jpg", "jpeg"], // Allowed formats for uploaded images
  },
});

// Export Cloudinary and storage setup for use in your app
module.exports = {
  cloudinary,
  storage,
};
