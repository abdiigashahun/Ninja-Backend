const express = require("express");
const Order = require("../models/Order");
const { protect, admin} = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AdminOrders
 *   description: Admin order management
 */

// @route GET /api/admin/orders
// @route Get all order (Admin only)
// @access Private/Admin

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [AdminOrders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

router.get("/", protect, admin, async (req, res) => {
    try {
        const orders = await Order.find({}).populate("user", "name email");
        res.json(orders);
    }catch (error) {
        console.error(error);
        res.status(500).json({message: "Server Error"});
    }
});

// @route PUT /api/admin/orders/:id
// @desc Update order status
// @access Private/Admin


/**
 * @swagger
 * /api/admin/orders/{id}:
 *   put:
 *     summary: Update order status (Admin only)
 *     tags: [AdminOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Order ID to update
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Order status update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: Delivered
 *     responses:
 *       200:
 *         description: Updated order object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */


router.put("/:id", protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate("user", "name");
        if (order){
            order.status = req.body.status || order.status;
            order.isDelivered =
            req.body.status === "Delivered" ? true : order.isDelivered;
            order.deliveredAt =
            req.body.status === "Delivered" ? Date.now() : order.deliveredAt;

            const updateOrder = await order.save();
            res.json(updateOrder);
        }else {
            res.status(404).json({ message: "Order not found"});
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error"});
    }
})

// @route DELETE /api/admin/orders/:id
// @desc Delete an order
// @access Private/Admin


/**
 * @swagger
 * /api/admin/orders/{id}:
 *   delete:
 *     summary: Delete an order (Admin only)
 *     tags: [AdminOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Order ID to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order removed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */

router.delete("/:id", protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            await order.deleteOne();
            res.json({ message: "Order Removed"});
        } else {
            res.status(404).json({ message: "Order not found"});
        }
    }catch(error) {
        console.error(error);
        res.status(500).json ({ message: "Server Error"});
    }
})


 module.exports = router;

