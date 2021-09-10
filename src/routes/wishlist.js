const express = require('express');
const { requireSignin, userMiddleware } = require('../common-middleware');
const { addItemToWishlist, getWishlistItem, removeWishlistItems } = require('../controllers/wishlist');



const router = express.Router();


router.post('/user/wishlist/addtowishlist', requireSignin, userMiddleware, addItemToWishlist);
router.post('/user/getWishlistItems', requireSignin, userMiddleware, getWishlistItem);
router.post(
    '/user/wishlist/removeItem',
    requireSignin,
    userMiddleware,
    removeWishlistItems
  );

module.exports = router;    