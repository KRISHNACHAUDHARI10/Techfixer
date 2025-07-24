module.exports.isElectrician = (req ,res , next)=>{
    if(!req.session.electrician){
    req.flash("error", "You Need To Be Logged In!");
    return res.redirect("/electrician/login");
    }
    next();
}