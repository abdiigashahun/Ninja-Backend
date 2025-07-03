const express = require("express");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");


const router = express.Router();

// @route GET /api/orders/my-orders
// @desc Get logged-in users orders
// @access Private

/**
 * @swagger
 * /api/orders/my-orders:
 *   get:
 *     summary: Get logged-in user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders for the authenticated user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */

router.get("/my-orders", protect, async (req, res) => {
    try {
        // Find orders for the authenticated user
        const orders = await Order.find({ user: req.user._id }).sort({
            createdAt: -1,
        }); // sort by most recent orders
        res.json(orders);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error"})
    }
})

// @route GET /api/orders/:id
// @desc Get order details by ID
// @access Private

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order details by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Order ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */

router.get("/:id", protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate(
            "user",
            "name email"
        );

        if (!order) {
            return res.status(404).json ({ message: "Order not found"});
        }

        // Return the full order details
        res.json(order);
    } catch (error){
        console.error(error);
        res.status(500).json({ message: "Server Error"})
    }
})
module.exports = router;