import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "books",
    allowed_formats: ["jpg", "jpeg", "png", "svg"],
    transformation: [{ width: 500, height: 750, crop: "limit" }],
  },
});

export { cloudinary, storage };
