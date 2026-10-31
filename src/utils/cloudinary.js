
import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  debug: true,
});

// Check whether Cloudinary environment variables are loaded
console.log("Cloudinary config check:", {
  cloudNameLoaded: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
  apiKeyLoaded: Boolean(process.env.CLOUDINARY_API_KEY),
  apiSecretLoaded: Boolean(process.env.CLOUDINARY_API_SECRET),
});

// Upload file to Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) {
    console.error("No local file path provided");
    return null;
  }

  try {
    // Validate environment variables
    const {
      CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET,
    } = process.env;

    if (
      !CLOUDINARY_CLOUD_NAME ||
      !CLOUDINARY_API_KEY ||
      !CLOUDINARY_API_SECRET
    ) {
      throw new Error(
        "Missing Cloudinary environment variables. Check your .env file."
      );
    }

    // Check if local file exists
    if (!fs.existsSync(localFilePath)) {
      throw new Error(`Local file not found: ${localFilePath}`);
    }

    // Upload to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("Cloudinary upload successful:", {
      publicId: response.public_id,
      format: response.format,
      resourceType: response.resource_type,
    });

    return response;
  } catch (error) {
    console.error("Cloudinary upload failed!");

    console.error("Message:", error.message);
    console.error("HTTP Code:", error.http_code);
    console.error("Error Name:", error.name);
    console.error("Error Details:", error.error ?? null);
    console.error("Response Body:", error.response?.body ?? null);

    console.dir(error, { depth: 5 });
    return null;
  } finally {
    // Clean up temporary file after success or failure
    try {
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
        console.log("Temporary file cleaned up");
      }
    } catch (cleanupError) {
      console.error(
        "Temporary file cleanup failed:",
        cleanupError.message
      );
    }
  }
};

export { uploadOnCloudinary };
