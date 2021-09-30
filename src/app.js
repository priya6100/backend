const express = require("express");
const path = require("path");
const Razorpay = require("razorpay");
const shortid = require("shortid");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const paymentRoute = require('./routes/razorpay');
const {products} = require('./data');

require("dotenv").config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

var razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.post("/verification", (req, res) => {
  const secret = "razorpaysecret";

  console.log(req.body);

  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  console.log(digest, req.headers["x-razorpay-signature"]);

  if (digest === req.headers["x-razorpay-signature"]) {
    console.log("request is legit");
    res.status(200).json({
      message: "OK",
    });
  } else {
    res.status(403).json({ message: "Invalid" });
  }
});

app.post("/razorpay", async (req, res) => {
  const payment_capture = 1;
  const amount = 500;
  const currency = "INR";

  const options = {
    amount,
    currency,
    receipt: shortid.generate(),
    payment_capture,
  };

  try {
    const response = await razorpay.orders.create(options);
    console.log(response);
    res.status(200).json({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (err) {
    console.log(err);
  }
});




require("dotenv").config();

// const app = express();

// app.use(cors());
// app.use(bodyParser.json());

// var razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

app.get('/products', (req, res)=> {
  res.status(200).json(products);
});

app.get("/order/:productId", (req, res) => {
  const { productId } = req.params;
  
})
app.get("/logo.svg", (req, res) => {
  res.sendFile(path.join(__dirname, "logo.svg"));
});

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});


app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.set('view engine', 'ejs')


let user = {
  id: "lakdjfvbnkj2424t2",
  email: "newgraps@gmail.com",
  password: "123456;'654321'"
};

const JWT_SECRET = 'some super secret...'

app.get('/welcome', (req,res) => {
  res.status(200).json({
    message: "Hello world!"
  });
});

app.get('/forgot-password', (req, res, next) => {
 res.render('forgot-password');
});

app.post('/forgot-password', (req, res, next) => {
  const { email } = req.body;
    if (email !== user.email) {
      res.send('User not registered');
      return;
    }

    const secret = JWT_SECRET + user.password
    const payload = {
      email: user.email,
      id: user.id
    }
    const token = jwt.sign(payload, secret, {expiresIn: '15m'})
    const link = `http://localhost:3000/reset-password/${user.id}/${token}`
    console.log(link)
    res.send('Password reset link has been sent to your email...')
});

app.get('/reset-password/:id/:token', (req, res, next) => {
  const { id, token } = req.params
  res.send(req.params);

  if (id !== user.id) {
    res.send('Invalid id...');
  }
});

app.post('/reset-password', (req, res, next) => {

});

app.listen(3000, () => console.log('@ http://localhost:7000'));