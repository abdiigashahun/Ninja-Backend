const express = require ("express");
const User = require("../models/User");
const { protect, admin} = require("../middleware/authMiddleware");

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: AdminUsers
 *   description: Admin user management
 */

// @route GET /api/admin.users
// @desc Get all users (Admin only)
// @access Private/Admin


/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [AdminUsers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */


router.get("/", protect, admin, async (req, res) => {
   try {
    const users = await User.find({});
    res.json(users);

   }catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error"})
   }
});

// @route POST /api/admin/users
// @desc Add a new user (admin only)
// @access Private/Admin


/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Add a new user (Admin only)
 *     tags: [AdminUsers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: User info to create
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
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 example: customer
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: User already exists
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

router.post("/", protect, admin, async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        let user = await User.findOne({ email});
        if (user) {
            return res.status(400).json({ message: "User already exists "});
        } 
        user = new User ({
            name,
            email,
            password,
            role: role || "customer",

        });

        await user.save();
        res.status(201).json({ message: "User created successfully", user});

        

        }catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server Error"});
    }
})

// @route /api/admin/users/:id
// @desc Update user info (admin only) - Name, email and role
// @access Private/Admin



/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Update user info (Admin only)
 *     tags: [AdminUsers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID to update
 *         schema:
 *           type: string
 *     requestBody:
 *       description: User fields to update (name, email, role)
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

router.put("/:id", protect, admin, async (req, res) =>{
    try {
        const user = await User.findById(req.params.id);
            if (user) {
                user.name = req.body.name || user.name;
                user.email = req.body.email || user.email;
                user.role = req.body.role || user.role;
            }
            const updateUser = await user.save();
            res.json({ message: "User updated successfully", user: updateUser});
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error'})
    }
    
})

// @route delte /api/admin/users/:id
// @desc Delete a user
// @access Privat/Admin



/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete a user (Admin only)
 *     tags: [AdminUsers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

router.delete("/:id", protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.deleteOne();
            res.json({ message: "User not found"});
        } else {
            res.status(404).json({ mssage: "User not found "});

        }

    } catch(error){
         console.error(error);
        res.status(500).json({ message: 'Server Error'})
    }
})

module.exports = router;