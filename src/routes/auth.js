const express = require('express');
// const { requireSignin } = require('../common-middleware');
const { signup, signin, googlelogin, facebooklogin } = require('../controllers/auth');
const user = require('../models/user');

const { validateRequest, isRequestValidated, validateSigninRequest } = require('../validator/auth');
const router = express.Router();

router.post('/signup', validateRequest, isRequestValidated, signup);
router.post('/signin', validateSigninRequest, isRequestValidated, signin);

router.post('/googlelogin', googlelogin);
router.post ('/facebooklogin', facebooklogin);
// router.post('/profile', requireSignin, (req, res)=>{
//     const uname = req.user._id;
//     console.log(uname);
//     res.status(200).json({user: uname})
// });

module.exports = router;