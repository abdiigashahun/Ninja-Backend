const express = require("express");
const Product = require("../models/Product");
const { protect, admin} = require("../middleware/authMiddleware");

router = express.Router();

// @route GET /api/admin/products
// @desc Get all products (Admin only)
// @axxess Private/Admin

/**
 * @swagger
 * /api/admin/products:
 *   get:
 *     summary: Get all products (Admin only)
 *     tags: [Admin - Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (not an admin)
 *       500:
 *         description: Server error
 */

router.get("/", protect, admin, async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    }catch (error) {
          console.error(error);
        res.status(500).json({ message: 'Server Error'})
    }
})
module.exports = router;