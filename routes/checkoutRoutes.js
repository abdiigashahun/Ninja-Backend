const express = require("express");
const Checkout = require("../models/Checkout");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order= require("../models/Order");
const {protect} = require("../middleware/authMiddleware");

const router = express.Router();
// @route POST /api/checkout
// @desc Create a new checkout session
// @access Private

/**
 * @swagger
 * /api/checkout:
 *   post:
 *     summary: Create a new checkout session
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - checkoutItems
 *               - shippingAddress
 *               - paymentMethod
 *               - totalPrice
 *             properties:
 *               checkoutItems:
 *                 type: array
 *                 items:
 *                   type: object
 *               shippingAddress:
 *                 type: object
 *               paymentMethod:
 *                 type: string
 *               totalPrice:
 *                 type: number
 *     responses:
 *       201:
 *         description: Checkout session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Checkout'
 *       400:
 *         description: No items in checkout
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */


router.post("/", protect, async (req, res) => {
    const { checkoutItems, shippingAddress, paymentMethod, totalPrice} = req.body;
     

    if (! checkoutItems || checkoutItems.length ===0){
        return res.status(400).json ({ message: "no items in checkout"});

    }
    try {
        // Create a new checkout session
        const newCheckout = await Checkout.create({
            user: req.user._id,
            checkoutItems: checkoutItems,
            shippingAddress,
            paymentMethod,
            totalPrice,
            paymentStatus: "Pending",
            isPaid: false,
        });
        console.log(`Checkout created for user:" ${req.user._id}`);
        res.status(201).json(newCheckout);
    }catch (error) {
        console.error("Error Creating checkout session:", error);
        res.status(500).json({ message: "Server Error"});
    }
})

/**
 * @swagger
 * /api/checkout/{id}/pay:
 *   put:
 *     summary: Update checkout to mark as paid after successful payment
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Checkout ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentStatus
 *             properties:
 *               paymentStatus:
 *                 type: string
 *               paymentDetails:
 *                 type: object
 *     responses:
 *       200:
 *         description: Checkout updated as paid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Checkout'
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Checkout not found
 *       500:
 *         description: Server error
 */



// @route PUT /api/checkout/:id/pay
// desc Update checkout to mark as paid after succesfful payment
// @accees Private

router.put("/:id/pay", protect, async(req, res) =>{
    const {paymentStatus, paymentDetails } = req.body;

    try {
        const checkout = await Checkout.findById(req.params.id);
        if (!checkout) {
            return res.status(404).json ({ message: "Checkout not found"});

        }
        if (paymentStatus === "paid") {
            checkout.isPaid = true;
            checkout.paymentStatus = paymentStatus;
            checkout.paymentDetails = paymentDetails;
            checkout.paidAt = Date.now();
            await checkout.save();

            res.status(200).json(checkout);
        } else{
            res.status(400).json({ message: "Invalid Status"});

        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error"})
    }
})

// @route POST /api/checkout/:id/finalize
// @desc Finalize checkout and convert to an order after payment confirmation
// @access Private

/**
 * @swagger
 * /api/checkout/{id}/finalize:
 *   post:
 *     summary: Finalize checkout and convert to an order after payment confirmation
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Checkout ID
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Order created successfully from checkout
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Checkout already finalized or not paid
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Checkout not found
 *       500:
 *         description: Server error
 */
router.post("/:id/finalize", protect, async(req,res) => {
    try{
        const checkout = await Checkout.findById(req.params.id);

        if (!checkout) {
            return res.status(404).json({ message: "Checkout not found"});
        }

        if(checkout.isPaid && !checkout.isFinalized) {
            // Create final order based on the checkout details
            const finalOrder = await Order.create({
                user: checkout.user,
                orderItems: checkout.checkoutItems,
                shippingAddress: checkout.shippingAddress,
                paymentMethod: checkout.paymentMethod,
                totalPrice: checkout.totalPrice,
                isPaid: true,
                paidAt: checkout.paidAt,
                isDelivered: false,
                paymentStatus: "paid",
                paymentDetails: checkout.paymentDetails,
            });

            // Mark the checkout as finalized
            checkout.isFinalized = true;
            checkout.finalizedAt = Date.now();
            await checkout.save();
            // Delete the cart associated with the user
            await Cart.findOneAndDelete({ user: checkout.user});
            res.status(201).json(finalOrder);
        } else if (checkout.isFinalized) {
            res.status(400).json({ message: "Checkout already finalized"});

        } else {
            res.status(400).json({ message: "Checkout is not paid"});

        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error"})
    }
});
module.exports = router;