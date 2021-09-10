const Wish = require('../models/wishlist');
exports.addItemToWishlist = (req, res) =>{


Wish.findOne({user: req.user._id})
.exec((error, wish) =>{
    if(error) return res.status(400).json({error});
    if(wish){
       //update cart
      const product = req.body.wishListItems.product;
      const item = wish.wishListItems.find(c => c.product == product)
let condition, update;
if(item){
    condition = {"user": req.user._id, "wishListItems.product": product};
    update = {
        
        "$set": {
            "wishListItems.$":{
                ...req.body.wishListItems,
               
            }
        }

       };


}else{
    condition = {user: req.user._id};
    update = {
        
        "$push": {
            "wishListItems":req.body.wishListItems
        }

       };

}

//if case
 
Wish.findOneAndUpdate(condition, update)
   .exec((error, _wish) => {
    if(error) return res.status(400).json({error});
    if(_wish){
        return res.status(201).json({message: 'alredy there'})
    }
   });

        //  res.status(200).json({message: cart})

    } else{
//create new cart

        const wish = new Wish({
            user: req.user._id,
            wishListItems: [req.body.wishListItems]
        });
        
        
        wish.save((error, wish) =>{
            if(error) return res.status(400).json({error});
            if(wish){
                return res.status(201).json({wish})
            }
        });
        

    }
});


};

exports.getWishlistItem = (req, res) => {
  //const { user } = req.body.payload;
  //if(user){
  Wish.findOne({ user: req.user._id })
    .populate('wishListItems.product', '_id name price productPictures')
    .exec((error, wish) => {
      if (error) return res.status(400).json({ error });
      if (wish) {
        let wishListItems = {};
        wish.wishListItems.forEach((item, index) => {

          wishListItems[item.product._id.toString()] = {
            _id: item.product._id.toString(),
            name: item.product.name,
            img: item.product.productPictures[0].img,
            price: item.product.price,
           
          };
          
        });
          

        console.log(wishListItems);

        res.status(200).json({ wishListItems });
      }
    });
  //}
};

// exports.removeWishlistItems = (req, res) => {
//   const {wishListItems.productId}  = req.body.payload;
//   console.log(req.body);
//   if (wishListItems) {

//     Wish.updateOne(
//       { user: req.user._id },
//       {
//         $pull: {
//           wishListItems: {
//             product: wishListItems,
//           },
//         },
//       }
//     ).exec((error, result) => {
//       if (error) return res.status(400).json({ error });
//       if (result) {
//         res.status(202).json({ result });
//       }
//     });
//   }
// };

exports.removeWishlistItems = (req, res) => {
  const { productId } = req.body.payload;
  if (productId) {
    wish.update(
  
      {
        $pull: {
          wishListItems: {
            product: productId,
          },
        },
      }
    ).exec((error, result) => {
      if (error) return res.status(400).json({ error });
      if (result) {
        res.status(202).json({ result });
      }
    });
  }
};