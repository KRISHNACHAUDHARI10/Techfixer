const express = require('express');
const engine = require("ejs-mate");
const app  = express();
const path = require('path')
const bodyparser=require('body-parser');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const dotenv = require('dotenv');
const methodOverride = require('method-override');
const userRoutes = require('./routes/custom.routes/user.routes.js')
const adminRoute = require('./routes/Admin.routes/admin.routes.js')
const electricianRoute = require('./routes/Electrician.routes/electrician.route.js')

dotenv.config();
const PORT = process.env.PORT || 5000
app.use(express.json());


app.engine("ejs", engine);
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(bodyparser.urlencoded({extended:true}))
app.use(express.static('public'))



mongoose.connect(process.env.MONGO_URL)
    .then(()=>{console.log('database connected successfully')})
    .catch((err)=>{console.log(err)})



    app.use(
        session({
          secret: "this is my secreat key",
          resave: false,
          saveUninitialized: true,
          cookie: {
            expires: Date.now() * 7 * 24 * 60 * 60 * 1000,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
          },
        })
      );
    
    app.use(flash()); 

    app.use((req, res, next) => {
        res.locals.success = req.flash("success"); 
        res.locals.error = req.flash("error");  
          res.locals.session = req.session;    
        res.locals.isLogged = req.session.user;   
        next();
      });
app.get("/" , (req ,res)=>{
  res.redirect("/user/")
});
app.use("/user" , userRoutes);
app.use("/admin" , adminRoute);
app.use('/electrician', electricianRoute);

app.all("*", (req, res, next) => {
  res.render("custom/pages/pageNotFoun.ejs")
}); 


app.listen(PORT , ()=>{
    console.log(`server is listening on http://localhost:${PORT}`)
});