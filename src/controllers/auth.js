const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const shortid = require("shortid");
const {OAuth2Client} = require('google-auth-library');
const fetch = require('node-fetch');
const client = new OAuth2Client("800480683042-qdqo4a9hi5dboglr97e4tvmvab0er1lu.apps.googleusercontent.com")
const generateJwtToken = (_id, role) => {
  return jwt.sign({ _id, role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};



exports.signup = (req, res) => {
  User.findOne({ email: req.body.email }).exec(async (error, user) => {
    if (user)
      return res.status(400).json({
        error: "User already registered",
      });

    const { firstName, lastName, email, password } = req.body;
    const hash_password = await bcrypt.hash(password, 10);
    const _user = new User({
      firstName,
      lastName,
      email,
      hash_password,
      username: shortid.generate(),
    });

    _user.save((error, user) => {
      if (error) {
        return res.status(400).json({
          message: "Something went wrong",
        });
      }

      if (user) {
        const token = generateJwtToken(user._id, user.role);
        const { _id, firstName, lastName, email, role, fullName } = user;
        return res.status(201).json({
          token,
          user: { _id, firstName, lastName, email, role, fullName },
        });
      }
    });
  });
};

exports.signin = (req, res) => {
  User.findOne({ email: req.body.email }).exec(async (error, user) => {
    if (error) return res.status(400).json({ error });
    if (user) {
      const isPassword = await user.authenticate(req.body.password);
      if (isPassword && user.role === "user") {
        // const token = jwt.sign(
        //   { _id: user._id, role: user.role },
        //   process.env.JWT_SECRET,
        //   { expiresIn: "1d" }
        // );
        const token = generateJwtToken(user._id, user.role);
        const { _id, firstName, lastName, email, role, fullName } = user;
        res.status(200).json({
          token,
          user: { _id, firstName, lastName, email, role, fullName },
        });
      } else {
        return res.status(400).json({
          message: "Something went wrong",
        });
      }
    } else {
      return res.status(400).json({ message: "Something went wrong" });
    }
  });
};

exports.googlelogin = (req, res) => {
  const {tokenId} = req.body;

  client.verifyIdToken({idToken: tokenId,audience: "800480683042-qdqo4a9hi5dboglr97e4tvmvab0er1lu.apps.googleusercontent.com"}).then(response =>{
    const {email_verified, name, email} = response.payload;
   if(email_verified){
     User.findOne({email}).exec((err,user) =>{
       if(err){
         return res.status(400).json({
           error: "Something went wrong..."
         })
       } else {
         if(user) {
          const token = jwt.sign({_id: user._id}, process.env.JWT_SIGNIN_KEY, {expiresIn: '7d'})
          const {_id, name, email} = user;

          res.json({
            token,
            user: {_id, name, email}
          })
         } else {
           let password = email+process.env.JWT_SIGNIN_KEY;
          let newUser = new User({name, email, password});
          newUser.save((err, data) =>{
            if(err){
            return res.status(400).json({
              error: "Something went wrong..."
          })

         }
         const token = jwt.sign({_id: data._id}, process.env.JWT_SIGNIN_KEY, {expiresIn: '7d'})
          const {_id, name, email} = newUser;

          res.json({
            token,
            user: {_id, name, email}
          })
     })
   }
  }
    // console.log(response.payload);
  })
}
  })
  console.log()
}

exports.facebooklogin = (req, res) => {
  
}