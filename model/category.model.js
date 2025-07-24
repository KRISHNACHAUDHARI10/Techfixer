const mongoose = require('mongoose');

const schema = mongoose.Schema({
    category_name:{
        type:String , 
        unique:[true , 'Category already exist. !!!'],
        required:true,
        
    },
    category_image:{
        type:String,
        requried:true,
    }
});


const Category = mongoose.model("Category" , schema);
module.exports = Category;