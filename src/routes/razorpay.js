const express = require('express');
const { requireSignin, userMiddleware } = require('../common-middleware');
const { showRazorpay } = require('../controllers/razorpay');



const router = express.Router();


router.post('/user/razorpay', requireSignin, userMiddleware, showRazorpay );

module.exports = router;    