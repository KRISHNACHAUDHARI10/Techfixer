const mongoose = require('mongoose');

const schema = mongoose.Schema({
    first_name:{
        type: String,
        required: [true, 'Please enter username'],
        minLength: [2, 'Username must be more than 2 characters'],
        maxLength: [20, 'Username must be less than 20 characters'],
    },
    last_name:{
        type: String,
        required: [true, 'Please enter username'],
        minLength: [2, 'Username must be more than 2 characters'],
        maxLength: [20, 'Username must be less than 20 characters'],
    },
      email: {
            type: String,
            required: [true, 'Please enter an email'],
            unique: [true, 'Email already exist '],
            lowercase: true,
            minLength: [5, 'Email must be more than 5 characters'],
        }, 

        address:{
            type: String,
            required: [true, 'Please enter address']
        },
         password: {
            type: String,
            required: [true, 'Please enter password'],
            minLength: [6, 'Minimum password length is 6 characters'],
        },
   
   
    phone:
    {type:Number ,
        required:[true , 'please enter phone'] ,
        minLength: [10, 'provide valid phone number'],
        maxLength: [10, 'provide valid phone number'],
        }
});

const Electrician = new mongoose.model('Electrician',schema);
module.exports = Electrician;