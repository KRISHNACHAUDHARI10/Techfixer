const User = require('../../model/user.model.js')
const bcrypt  = require('bcrypt');
exports.signupForm = (req, res) => {
    res.render("custom/user/signup.ejs");
  };
  
exports.signupLogic = async (req, res) => {
  
    try {
    const { username, email, password, phone } = req.body;
    const hashedPassword = await bcrypt.hash(password ,10)
      
    const newUser = new User({ username, email, password:hashedPassword, phone });
      await newUser.save();
      req.session.user = newUser;
      if (!req.session.user.cart) {
        req.session.user.cart = [];
      }
      req.flash('success', 'User registered successfully!');
      res.redirect('/user/');
    } 
    catch (err) {
      // If there are validation errors, Mongoose will include them in `err.errors`
      if (err.name === 'ValidationError') {
          const errors = Object.values(err.errors).map(error => error.message);
          req.flash("error", errors);
      }
      res.redirect('/user/signup');
  }
    
}
    
    

  

exports.loginForm = (req ,res) =>{
    res.render("custom/user/login.ejs")
  }


exports.loginLogic = async (req,res)=>{
  const {email , password} =req.body;
    const user = await User.findOne({email});
    if(!user){
      req.flash("error", "Enter correct details");
        res.redirect('/user/login')
    }
    else{
    
    const isMatch = await bcrypt.compare(password , user.password);
   

        if(isMatch){
           req.flash('success', `welcome back ${user.username}`);
           req.session.user = user;
          if (!req.session.user.cart) {
            req.session.user.cart = [];
          }
            res.redirect('/user/')
        }
        else{
          req.flash('error', 'Email Or Password is Wrong');
           res.redirect('/user/login')

        }
    }
};

// exports.logoutLogic = (req,res)=>{
//     req.flash('success','Logged Out');
//   req.session.destroy((err) => {
//     if (err) {
//       return res.redirect('/error'); // Handle error appropriately
//     }
//     res.clearCookie('connect.sid'); // Clears the session cookie
//     res.redirect('/user/login'); // Redirect to the login page or another appropriate route
//   });
// }


exports.logoutLogic = (req,res)=>{
    req.flash('success','Logged Out');
    req.session.user = undefined;
    res.redirect('/user/login'); // Redirect to the login page or another appropriate route


}