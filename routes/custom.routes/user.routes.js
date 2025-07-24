const express = require('express');
const router = express.Router();
const userController = require("../../controller/custom.controller/user.controller.js")
const Category = require('../../model/category.model.js');
const Service = require('../../model/services.model.js')
const Order = require('../../model/order.model.js')
const {isLoggedIn} = require('../../middleware/auth.middleware.js')
const stripe = require("../../utils/stripe.js");

router
    .route("/login")
    .get(userController.loginForm)
    .post(userController.loginLogic)
    

router
    .route("/signup")
    .get(userController.signupForm)
    .post(userController.signupLogic)

router.get("/logout" , userController.logoutLogic)

router.post("/checkout" ,isLoggedIn ,  (req ,res)=>{
    obj = req.body
    res.render("custom/pages/checkout.ejs" , obj)
})




// Route to create a Stripe Checkout session
router.post("/create-checkout-session", async (req, res) => {
  const { data, user, fname, lname, email, address, city, state, zipcode, notes, locality } = req.body;
  const parsedData = JSON.parse(data);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: Object.entries(parsedData.product).map(([name, [qty, price]]) => ({
      price_data: {
        currency: "inr",
        product_data: { name },
        unit_amount: price * 100, // amount in paisa
      },
      quantity: qty,
    })),
    success_url: `http://localhost:8081/user/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `http://localhost:8081/user/checkout`,
    
    metadata: {
      user,
      data,
      fname,
      lname,
      email,
      address,
      city,
      state,
      zipcode,
      notes,
      locality
    }
  });

  res.json({ id: session.id });
});

  
  router.get("/payment-success", async (req, res) => {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
  
    // Retrieve metadata (contains all customer info you collected earlier)
    const {
      user,
      data,
      fname,
      lname,
      email,
      address,
      city,
      state,
      zipcode,
      notes
    } = session.metadata;
  
    const parsedData = JSON.parse(data);
    const productList = Object.entries(parsedData.product).map(([name, [qty, price]]) => ({
      name,
      quantity: qty,
      price
    }));
  
    const newOrder = new Order({
      user,
      products: productList,
      subtotal: parsedData.subtotal,
      total: parsedData.total,
      shippingAddress: {
        fname,
        lname,
        email,
        address,
        city,
        state,
        zipcode,
        notes
      },
      payment: {
        stripeSessionId: session.id,
        paymentStatus: session.payment_status
      },
      payment_status: "Paid"
    });
  
    await newOrder.save();
    req.session.user.cart = [];
    res.redirect("/user/thankyou");
  });
  

router.get("/thankyou",(req,res)=>{
  res.render("custom/pages/paymentSuccess.ejs" )
    
})




router.get('/my-orders', isLoggedIn, async (req, res) => {
  try {
    const filter = { user: req.session.user._id};
    if (req.query.status) filter.status = req.query.status;

    const orders = await Order.find(filter)
      .populate('electrician', 'first_name last_name email phone')
      .sort({ createdAt: -1 });
      res.render("custom/pages/order.ejs" ,{orders});
  } catch (err) {
    res.status(401).send(err);
    console.log(err)
  }
});

// Cancel Order (Pending only)
router.post('/my-orders/:id/cancel', isLoggedIn, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.session.user._id });
    if (!order || order.status !== 'Pending') {
      return res.status(400).send('Cannot cancel this order');
    }
    order.status = 'Cancelled';
    await order.save();
    res.redirect('/user/my-orders');
  } catch (err) {
    res.status(500).send('Something went wrong');
  }
});




router.get("/service" , isLoggedIn , async (req ,res)=>{
    const data = await Service.find().sort({ category_name: 1 });
    let catry = await Category.find().sort({ category_name: 1 });
    let cart_item = req.session.user.cart;
    let obj ={"service":data , "category":catry , "cartdata":cart_item}
    res.render("custom/pages/category.ejs" ,obj)
});

router.get("/addCart" , isLoggedIn, (req , res)=>{
    let {service} = req.query; 
    if (service) {
    if (!req.session.user.cart) {
          req.session.user.cart = [];
        }
        req.flash("success","Service Added To Cart .");
        req.session.user.cart.push(service);
      }
    res.redirect("/user/service")
});

router.get("/removeService" ,isLoggedIn, (req , res)=>{
    let {service} = req.query; 
    if (service && req.session.user.cart.includes(service)) {
        let index = req.session.user.cart.indexOf(service); // Find index of value 3

if (index !== -1) {
    req.session.user.cart.splice(index, 1);  // Remove the element at the found index
}
        req.flash("success","Service Removed");
      
      }
    res.redirect("/user/cart")
});

router.get("/cart" , isLoggedIn ,async (req,res)=>{
    let item = req.session.user.cart
    let obj = []
    for(let i =0;i<item.length ; i++){
        let service =await Service.findById(item[i]);
        obj.push(service);
    }
    res.render("custom/pages/cart.ejs" , {"services":obj})
    

})


//pages render logic

router.get("/" , (req ,res)=>{
    res.render("custom/pages/home.ejs" )
})

router.get("/about" ,isLoggedIn, (req ,res)=>{
    res.render("custom/pages/about_us.ejs" )
})

router.get("/blog" ,isLoggedIn, (req ,res)=>{
    res.render("custom/pages/blog.ejs" )
})

router.get("/contact" ,isLoggedIn, (req ,res)=>{
    res.render("custom/pages/contact.ejs" )
})
module.exports =  router;