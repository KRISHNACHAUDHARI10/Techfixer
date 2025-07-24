module.exports.isLoggedIn = (req ,res , next)=>{
    if(!req.session.user){
    req.flash("error", "You Need To Be Logged In!");
    return res.redirect("/user/login");
    }
    next();
}