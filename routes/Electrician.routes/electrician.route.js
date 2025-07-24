const express = require('express');
const router = express.Router();
const Order = require('../../model/order.model.js')
const Electrician = require('../../model/electrician.model.js')
const bcrypt = require('bcrypt')
const {isElectrician} = require('../../middleware/electrician.middleware.js')
// GET: Electrician Dashboard (Task Stats)

router.get("/", isElectrician ,(req , res)=>{
  res.redirect("/electrician/dashboard");
})


router.get('/dashboard', isElectrician, async (req, res) => {
  const electricianId = req.session.electrician._id;

  const allOrders = await Order.find({ electrician: electricianId });

  const stats = {
    total: allOrders.length,
    assigned: allOrders.filter(o => o.status === 'Assigned').length,
    inProgress: allOrders.filter(o => o.status === 'In Progress').length,
    completed: allOrders.filter(o => o.status === 'Completed').length,
    cancelled: allOrders.filter(o => o.status === 'Cancelled').length,
  };

  res.render('electrician/pages/electrician-dashboard', { stats });
});

// GET: Assigned tasks
router.get('/tasks',isElectrician, async (req, res) => {
    const filter = req.query.status;
    const query = { electrician: req.session.electrician._id };
    if (filter && filter !== 'All') {
      query.status = filter;
    }
  
    const tasks = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
  
    res.render('electrician/pages/electrician-tasks', { tasks, filter: filter || 'All' });
  });

// POST: Update task status
router.post('/tasks/:id/status',isElectrician,  async (req, res) => {
  const { status } = req.body;
  const order = await Order.findOne({ _id: req.params.id, electrician: req.session.electrician._id  });
  if (!order) return res.status(403).send('Not authorized');
  order.status = status;
  await order.save();
  res.redirect('/electrician/tasks');
});



router.get("/login", (req,res)=>{
  res.render("electrician/pages/login.ejs")
})

router.post("/login" , async (req,res)=>{
  const {email , password} =req.body;
    const user = await Electrician.findOne({email});
    if(!user){
      req.flash("error", "Enter correct details");
        res.redirect('/electrician/login')
    }
    else{
    
    const isMatch = await bcrypt.compare(password , user.password);
   

        if(isMatch){
           req.flash('success', `welcome back ${user.first_name} ${user.last_name}`);
           req.session.electrician = user;
         
            res.redirect('/electrician/dashboard')
        }
        else{
          req.flash('error', 'Email Or Password is Wrong');
           res.redirect('/electrician/login')

        }
    }
})





router.get("/register", (req,res)=>{
  res.render("electrician/pages/register.ejs")
})

router.post("/register" ,async (req, res) => {
  
    try {
      let {first_name ,last_name , phone ,address ,email ,password} =req.body ; 
    const hashedPassword = await bcrypt.hash(password ,10)
      const newElectrician = new Electrician({first_name ,last_name , phone ,address ,email ,password:hashedPassword})
          await newElectrician.save()
      
          .then(()=> {req.flash('success', 'User registered successfully!')})
          .catch((err)=> req.flash('error',err))
      req.session.electrician = newElectrician;
      res.redirect('/electrician/dashboard');
    } 
    catch (err) {
      // If there are validation errors, Mongoose will include them in `err.errors`
      if (err.name === 'ValidationError') {
          const errors = Object.values(err.errors).map(error => error.message);
          req.flash("error", errors);
      }
      res.redirect('/electrician/register');
  }
    
})

router.get("/logout",(req,res)=>{
  req.flash('success','Logged Out');
  req.session.electrician = undefined;
  res.redirect('/electrician/login'); // Redirect to the login page or another appropriate route


})

module.exports = router;
