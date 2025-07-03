const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const {protect} = require("../middleware/authMiddleware");
const router = express.Router();
//@route POST /api/users/register
//@desc Register a new user
// @access Public
/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: strongpassword123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
router.post("/register", async (req, res) => {
    const{ name, email, password} = req.body;
    try {
        //Registration logic
      let user = await User.findOne({email});
      if(user) return res.status(400).json({message: "User already exists"});

      user = new User ({ name, email, password});
      await user.save();

     // Create JWT Payload
     const payload = {user: { id: user._id, role: user.role}};

     //Sign and return the token along with user data
     jwt.sign(payload, process.env.JWT_SECRET,

     { expiresIn: "40h"}, (err, token) => {
            if (err) throw err;

            // Send the user and token in response
            res.status(201).json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token,
                
            });

        });
         }catch (error){
        console.log(error);
        
    }
});
// @route POST /api/users/login
// @desc Authenticate user
// @ access public
/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login user and return JWT token
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: strongpassword123
 *     responses:
 *       200:
 *         description: Successful login
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    // If user not found or password doesn't match
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // Create token (synchronously)
    const token = jwt.sign(
      {
        user: {
          id: user._id,
          role: user.role,
        },
      },
      process.env.JWT_SECRET,
      { expiresIn: "40h" }
    );

    // Send user info and token
    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });

  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
});
//@route GET /api/users/profile
//@desc Get logged-in user's profile (Protected Route)
//@access private

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get the profile of the logged-in user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile info
 *       401:
 *         description: Unauthorized (No or invalid token)
 *       500:
 *         description: Server error
 */

router.get("/profile", protect, async (req, res) => {
    res.json(req.user);
})



module.exports = router;