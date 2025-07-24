const mongoose = require('mongoose');

const schema = mongoose.Schema({
    service_name:{
        type:String , 
        unique:[true , 'Service already exist. !!!'],
        // required:true,
        
    },
    category_name:{
        type:String,
        required:true,
    } , 
    service_image:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    time:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    }


});


const Service = mongoose.model("Service" , schema);
module.exports = Service;