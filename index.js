const express = require('express');
const env = require('dotenv');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const cors = require('cors');
//user routes

const userRoutes = require('./src/routes/auth');
const adminRoutes = require('./src/routes/admin/auth');
const categoryRoutes = require('./src/routes/category');
const productRoutes = require('./src/routes/product');
const cartRoutes = require('./src/routes/cart');
const initialDataRoutes = require('./src/routes/admin/initialData');
const pageRoutes = require('./src/routes/admin/page');
const addressRoutes = require('./src/routes/address');
const orderRoutes = require('./src/routes/order');
const adminOrderRoute = require('./src/routes/admin/order.route');
const wishListRoutes = require('./src/routes/wishlist');
const homeBannerRoutes = require('./src/routes/admin/homeBanner');

env.config();

mongoose.connect(
    `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@cluster0.7uw5h.mongodb.net/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`, 
    {
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        useCreateIndex:true
    
    }
    ).then(() =>{
        console.log("db connected");
    });
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use('/public',express.static(__dirname + '/src/uploads'));
app.use('/api', userRoutes);
app.use('/api', adminRoutes);
app.use('/api', categoryRoutes);
app.use('/api', productRoutes);
app.use('/api', cartRoutes);
// app.use('/api', razorpayRoutes);
app.use('/api', initialDataRoutes);
app.use('/api', pageRoutes);
app.use('/api', addressRoutes);
app.use('/api', orderRoutes);
app.use('/api', adminOrderRoute);
app.use('/api', wishListRoutes);
app.use('/api', homeBannerRoutes);
const port = process.env.PORT ;
app.listen(port, () => {console.log(`app listening on port ${port}`)})