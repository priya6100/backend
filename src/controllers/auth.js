const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const shortid = require("shortid");
const {OAuth2Client} = require('google-auth-library');
// const fetch = require('node-fetch');
const mailgun = require("mailgun-js");
const DOMAIN = 'sandbox8f097314e0454f61babd1b52952defab.mailgun.org';
const mg = mailgun({apiKey: "18d3ecd0a01de8a8f35e880f7ec96d2f-90346a2d-21d136ce", domain: DOMAIN});


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





exports.googlelogin = (req, res ) => {
  const {tokenId} = req.body;

  client.verifyIdToken({idToken: tokenId,audience: "800480683042-qdqo4a9hi5dboglr97e4tvmvab0er1lu.apps.googleusercontent.com"}).then(res =>{
    const {email_verified, name, email} = res.payload;
   if(email_verified){
     User.findOne({email}).exec((err,user) => {
       if(err){
         return res.status(400).json({
           error: "Something went wrong..."
         })
            } else {
              if(user) {
                const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'})
                const {_id, name, email} = user;

              res.json({
                 token,
                 user: {_id, name, email}
                })
         } else {
           let password = email+process.env.JWT_SECRET;
          let newUser = new User({name, email, password});
          newUser.save((err, data) =>{
            if(err) {
               return res.status(400).json({
              error: "Something went wrong..."
          })

         }
         const token = jwt.sign({_id: data._id}, process.env.JWT_SECRET, {expiresIn: '7d'})
          const {_id, name, email} = newUser;

          res.json({
            token,
            user: {_id, name, email}
          })
     })
   }
  }
    // console.log(res.payload);
  })
} 
  })
  console.log()
}























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






exports.forgotPasswordController = (req, res) => {
  const { email } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array().map(error => error.msg)[0];
    return res.status(422).json({
      errors: firstError
    });
  } else {
    User.findOne(
      {
        email
      },
      (err, user) => {
        if (err || !user) {
          return res.status(400).json({
            error: 'User with that email does not exist'
          });
        }

        const token = jwt.sign(
          {
            _id: user._id
          },
          process.env.JWT_RESET_PASSWORD,
          {
            expiresIn: '10m'
          }
        );

        const emailData = {
          from: process.env.EMAIL_FROM,
          to: email,
          subject: `Password Reset link`,
          html: `
                    <h1>Please use the following link to reset your password</h1>
                    <p>${process.env.CLIENT_URL}/users/password/reset/${token}</p>
                    <hr />
                    <p>This email may contain sensetive information</p>
                    <p>${process.env.CLIENT_URL}</p>
                `
        };

        return user.updateOne(
          {
            resetPasswordLink: token
          },
          (err, success) => {
            if (err) {
              console.log('RESET PASSWORD LINK ERROR', err);
              return res.status(400).json({
                error:
                  'Database connection error on user password forgot request'
              });
            } else {
              sgMail
                .send(emailData)
                .then(sent => {
                  // console.log('SIGNUP EMAIL SENT', sent)
                  return res.json({
                    message: `Email has been sent to ${email}. Follow the instruction to activate your account`
                  });
                })
                .catch(err => {
                  // console.log('SIGNUP EMAIL SENT ERROR', err)
                  return res.json({
                    message: err.message
                  });
                });
            }
          }
        );
      }
    );
  }
};

// exports.resetPasswordController = (req, res) => {
//   const { resetPasswordLink, newPassword } = req.body;

//   const errors = validationResult(req);

//   if (!errors.isEmpty()) {
//     const firstError = errors.array().map(error => error.msg)[0];
//     return res.status(422).json({
//       errors: firstError
//     });
//   } else {
//     if (resetPasswordLink) {
//       jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function(
//         err,
//         decoded
//       ) {
//         if (err) {
//           return res.status(400).json({
//             error: 'Expired link. Try again'
//           });
//         }

//         User.findOne(
//           {
//             resetPasswordLink
//           },
//           (err, user) => {
//             if (err || !user) {
//               return res.status(400).json({
//                 error: 'Something went wrong. Try later'
//               });
//             }

//             const updatedFields = {
//               password: newPassword,
//               resetPasswordLink: ''
//             };

//             user = _.extend(user, updatedFields);

//             user.save((err, result) => {
//               if (err) {
//                 return res.status(400).json({
//                   error: 'Error resetting user password'
//                 });
//               }
//               res.json({
//                 message: `Great! Now you can login with your new password`
//               });
//             });
//           }
//         );
//       });
//     }
//   }
// };


exports.facebookController = (req, res) => {
  console.log('FACEBOOK LOGIN REQ BODY', req.body);
  const { userID, accessToken } = req.body;

  const url = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;

  return (
    fetch(url, {
      method: 'GET'
    })
      .then(response => response.json())
      // .then(response => console.log(response))
      .then(response => {
        const { email, name } = response;
        User.findOne({ email }).exec((err, user) => {
          if (user) {
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
              expiresIn: '7d'
            });
            const { _id, email, name, role } = user;
            return res.json({
              token,
              user: { _id, email, name, role }
            });
          } else {
            let password = email + process.env.JWT_SECRET;
            user = new User({ name, email, password });
            user.save((err, data) => {
              if (err) {
                console.log('ERROR FACEBOOK LOGIN ON USER SAVE', err);
                return res.status(400).json({
                  error: 'User signup failed with facebook'
                });
              }
              const token = jwt.sign(
                { _id: data._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
              );
              const { _id, email, name, role } = data;
              return res.json({
                token,
                user: { _id, email, name, role }
              });
            });
          }
        });
      })
      .catch(error => {
        res.json({
          error: 'Facebook login failed. Try later'
        });
      })
  );
};

