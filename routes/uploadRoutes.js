const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const router = express.Router();
require("dotenv").config();

//Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup using memory storage

const storage = multer.memoryStorage();
const upload = multer({ storage});



/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload an image to Cloudinary
 *     description: Uploads a single image file and returns the secure Cloudinary URL.
 *     tags:
 *       - Upload
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imageUrl:
 *                   type: string
 *                   example: "https://res.cloudinary.com/your_cloud/image/upload/v1234567890/example.jpg"
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Server error
 */

router.post("/", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file Uploaded"});
        }
        // Function to handle the stream upload to Cloudniary
        const streamUpload = (fileBuffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream((error, result) => {
                    if (result) {
                        resolve(result);
                    }else {
                        reject(error);
                    }
                });
                // Use stremifier to convert file buffer to stream
                streamifier.createReadStream(fileBuffer).pipe(stream);

            })
        }
        // Call the streamUpload function
        const result = await streamUpload(req.file.buffer);

        // Respond with the uploaded image Url
        res.json ({ imageUrl: result.secure_url });

    }catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error"});
    }
})
module.exports = router;