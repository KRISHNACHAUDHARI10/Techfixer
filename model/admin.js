const mongoose  =require('mongoose');
const bcrypt = require('bcrypt')
const schema = new mongoose.Schema({
    username:{
        type:String,
        unique:true,
        required:true,
        
    },
    password:{
        type:String,
        required:true
    }
} 

)

// schema.pre("save" , async function(next){
//     if(!this.isModified("password")) return next();

//     this.password = await bcrypt.hast(this.password , 10);
//     next();

// })

// schema.methods.comparePassword=async function(password){
//     return bcrypt.compare(password , this.password)
// } 


const Admin = mongoose.model("Admin" , schema);
module.exports = Admin;
