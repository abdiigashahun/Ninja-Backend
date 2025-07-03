const express = require("express");
const router = express.Router();
const Subscriber = require("../models/Subscriber");

// @route POST /api/subscribe
// @desc Handle newsletter subscription
// @access Public

/**
 * @swagger
 * /api/subscribe:
 *   post:
 *     summary: Subscribe to newsletter
 *     description: Adds a user's email to the newsletter subscription list.
 *     tags:
 *       - Subscription
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *     responses:
 *       201:
 *         description: Successfully subscribed to the newsletter
 *       400:
 *         description: Email is missing or already subscribed
 *       500:
 *         description: Server error
 */

router.post("/", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json ({ message: "Email is required"});

    }
    try {
        // Check if the email is already subscribed
        let subscriber = await Subscriber.findOne({ email });

        if (subscriber) {
            return res.status(400).json({ message: "email is already subscribed"});
        }
        // Create a new subscriber
        subscriber = new Subscriber({ email});
        await subscriber.save();
        res.status(201).json({ message: "Successfully subscribed to the newsletter"});

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });

    }
})
module.exports = router;