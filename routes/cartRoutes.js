const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { protect } = require("../middleware/authMiddleware");


const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Cart management
 */
// Helper function to get a cart by user Id or guest ID
const getCart = async (userId, guestId) => {
    if (userId) {
        return await Cart.findOne({ user: userId});
    }else if (guestId) {
        return await Cart.findOne({ guestId });
    }
    return null;
}

//@route POST /api/cart
// @desc Add a product to the cart for a guest or logged in user
//@ access public


/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Add a product to the cart (guest or logged-in user)
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               size:
 *                 type: string
 *               color:
 *                 type: string
 *               guestId:
 *                 type: string
 *               userId:
 *                 type: string
 *             required:
 *               - productId
 *               - quantity
 *     responses:
 *       201:
 *         description: Created new cart or updated existing cart
 *       400:
 *         description: Product not found or bad request
 *       500:
 *         description: Server error
 */


router.post("/", async (req, res) => {
    console.log("DELETE /api/cart hit");
    const { productId, quantity, size, color, guestId, userId } = req.body;
    try {

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({message: "Product not found" });

        // Determine if the user is logged in or guest
        let cart = await getCart(userId, guestId);

        //If the cart exists, update it
        if (cart) {
            const productIndex = cart.products.findIndex(
                (p) => 
                    p.productId.toString() === productId &&
                p.size === size && p.color === color
            );

            if (productIndex > -1) {
                // If product already exists, update the quantity
                cart.products[productIndex].quantity += quantity;
            }else {
                //add new product
                cart.products.push ({
                    productId, 
                    name: product.name,
                    image: product.images[0].url,
                    price: product.price,
                    size,
                    color,
                    quantity,
                })
            }
//  Recalcilate the total price
cart.totalPrice = cart.products.reduce(
    (acc, item ) => acc + item.price * item.quantity,
0);
await cart.save();
return res.status(200).json(cart);
}else {
            //Create a new cart for the guest or user
            const newCart = await Cart.create ( {
                user: userId ? userId : undefined,
                guestId: guestId ? guestId : "guest_" + new Date().getTime(),
                products: [
                    {
                        productId,
                        name: product.name,
                        image: product.images[0].url,
                        price: product.price,
                        size,
                        color,
                        quantity,
                    },
                ],
                totalPrice: product.price * quantity,
            });
            return res.status(201).json(newCart);
        }
    }catch(error) {
        console.error(error);
        res.status(500).json({message: "Server Error"});
    }
});
// @route PUT /api/cart
// @desc Update product quantity in the cart for a guest or logged-in user
// @access Public

/**
 * @swagger
 * /api/cart:
 *   put:
 *     summary: Update product quantity in the cart (guest or logged-in user)
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               size:
 *                 type: string
 *               color:
 *                 type: string
 *               guestId:
 *                 type: string
 *               userId:
 *                 type: string
 *             required:
 *               - productId
 *               - quantity
 *     responses:
 *       200:
 *         description: Cart updated successfully
 *       404:
 *         description: Cart or product not found
 *       500:
 *         description: Server error
 */



router.put("/", async (req, res) => {
    const { productId, quantity, size, color, guestId, userId} = req.body;
    try {
        let cart = await getCart(userId, guestId);
        if (!cart) return res.status(404).json({ message: "Cart not found"});
        
        const productIndex = cart.products.findIndex(
            (p) => p.productId.toString() === productId
            && p.size === size &&
            p.color === color
        );

        if (productIndex > -1) {
            //update quantity
            if(quantity > 0 ) {
                cart.products[productIndex].quantity
 = quantity;
        }else {
            cart.products.splice(productIndex, 1); // Remove product if quantity is 0
        }
cart.totalPrice = cart.products.reduce((acc, item) => 
acc + item.price * item.quantity, 0);
await cart.save();
return res.status(200).json(cart);

   }else {
    return res.status(404).json({ message: "Product not found in Cart"});

   }
 }catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server"});
 }
});

// @route Delete /api/cart
// @desc Remove a product from a cart
// @access Public

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     summary: Remove a product from the cart (guest or logged-in user)
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               size:
 *                 type: string
 *               color:
 *                 type: string
 *               guestId:
 *                 type: string
 *               userId:
 *                 type: string
 *             required:
 *               - productId
 *     responses:
 *       200:
 *         description: Product removed from cart successfully
 *       404:
 *         description: Cart or product not found
 *       500:
 *         description: Server error
 */



router.delete("/", async (req, res) => {
    const { productId, size, color, guestId, userId } = req.body;
    try {
        let cart = await getCart(userId, guestId);

        if (!cart) return res.status(404).json({ message: "cart not found"});

        const productIndex = cart.products.findIndex (
            (p) => p.productId.toString() === productId && p.size === size && p.color === color
       
       
        );


        if (productIndex > -1) {
            cart.products.splice(productIndex, 1);

            cart.totalPrice = cart.products.reduce (
                (acc, item) => acc + item.price * item.quantity,
                0
            );
            await cart.save();
            return res.status(200).json(cart);
        } else {
            return res.status(404).json ({ message: "Product not found in cart"})
        }
    }catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error"});
    }
})

//@route GET /api/cart
// @desc Get logged-in user-s or guest user's cart
// @access Public

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get cart of logged-in user or guest user
 *     tags: [Cart]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: User ID for logged-in user
 *       - in: query
 *         name: guestId
 *         schema:
 *           type: string
 *         description: Guest ID for guest user
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *       404:
 *         description: Cart not found
 *       500:
 *         description: Server error
 */


router.get("/", async (req, res) => {
     console.log("BODY");
    const { userId, guestId } = req.query;
    try{
        const cart = await getCart(userId, guestId);
        if(cart) {
            res.json(cart);
        }else {
            res.status(404).json({ message: "Cart not found"}
            );

        }
    } catch(error) {
        console.error(error);
        res.status(500).json({ message: "Server Error"})
    }
})
 
// @route POST /api/cart/merge
// @desc Merge guest cart into user cart on login
// @access private

/**
 * @swagger
 * /api/cart/merge:
 *   post:
 *     summary: Merge guest cart into user cart after login
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               guestId:
 *                 type: string
 *             required:
 *               - guestId
 *     responses:
 *       200:
 *         description: Cart merged successfully
 *       400:
 *         description: Guest cart is empty
 *       404:
 *         description: Guest cart or user cart not found
 *       500:
 *         description: Server error
 */



router.post("/merge", protect, async (req, res) => {
   
    

    const { guestId } = req.body;
    try {
        //Find the guest cart and user cart
        const guestCart = await Cart.findOne({ guestId });
        const userCart = await Cart.findOne({ user: req.user._id });

        if(guestCart) {
            if(guestCart.products.length === 0) {
                return res.status(400).json({ message: "Guest cart is empty"});

            }

            if (userCart) {
                //Merge guest cart into user cart
                guestCart.products.forEach((guestItem) => {
                    const productIndex = userCart.products.findIndex(
                        (item) => 
                            item.productId.toString() === guestItem.productId.toString() &&
                        item.size === guestItem.size &&
                        item.color === guestItem.color

                    );
                    if (productIndex > -1) {
                        //If the items exists in the user cart, update the quantity
                        userCart.products[productIndex].quantity  += guestItem.quantity;

                    }else{
                        //Otherwise, add the guest item to the cart
                        userCart.products.push(guestItem);
                    }
                });

                userCart.totalPrice = userCart.products.reduce(
                    (acc, item) => acc + item.price * item.quantity,
                    0
                );
                await userCart.save();
                // Remove the guest cart after merging
                try {
                    await Cart.findOneAndDelete ({ guestId });

                }catch (error){
                    console.error("Error deleting guest cart:", error)
                }
                res.status(200).json(userCart);
            } else {
                //if the user has  no existing cart, assign the guest user to the user
                guestCart.user = req.user._id;
                guestCart.guestId = undefined;
                await guestCart.save();

                res.status(200).json(guestCart);

            }
        } else {
            if(userCart) {
                // gues cart has been already merged, return user cart
                return res.status(200).json(userCart);
            }
            res.status(404).json({ message: "Guest cart not found"});
        }
    } catch(error){
        console.error(error.message);
        res.status(500).json({ message: "Server Error"})
    }
})


module.exports = router;