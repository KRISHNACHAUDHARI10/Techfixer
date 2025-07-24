const mongoose = require('mongoose');
const User = require('../../model/user.model.js')
const Category = require('../../model/category.model.js');
const Service = require('../../model/services.model.js')
const Electrician = require('../../model/electrician.model.js')
const Order = require('../../model/order.model.js')
const Admin = require('../../model/admin.js')
const bcrypt = require('bcrypt')

exports.signup = async (req , res) =>{
    const {username , password} =req.body;
    const hashedPassword = await bcrypt.hash(password ,10)
    const newAdmin = new Admin({username , password:hashedPassword})
    await newAdmin.save()
        .then(()=>  ( 
            req.session.admin = username ,
             res.redirect("/admin/")))
        .catch((err)=> res.redirect("/"))
}

exports.login = async (req ,res)=>{
    const {username , password} =req.body;
       const user = await Admin.findOne({username});
       if(!user || !(await bcrypt.compare(password , user.password))){
           return res.status(401).json({
               message:"invalid access"
           })
       }
       req.session.admin = user.username ;
       return res.redirect("/admin/")
       
    
}

exports.manageHome =async (req,res)=>{
    let user =await User.countDocuments();
    let category =await Category.countDocuments();
    let service =await Service.countDocuments();
    let electrician =await Electrician.countDocuments();
    let order =await Order.countDocuments();

    const orders = await Order.find()
    .populate('user')
    .populate('electrician')
    .sort({ createdAt: -1 }); 

      let obj = {"ucount":user , "ccount":category , "scount":service ,"ecount":electrician,"bcount":order,"orders":orders}  
    res.render("admin/pages/home.ejs" , obj);
    }


exports.manageUser = async (req ,res)=>{
    let data = await User.find()
    res.render("admin/pages/manageUser.ejs" , {"users":data});
} 



exports.addElectrician = async (req ,res) =>{
    try {
        let {first_name ,last_name , phone ,address ,email ,password} =req.body ; 
        const hashedPassword = await bcrypt.hash(password ,10)
          const newElectrician = new Electrician({first_name ,last_name , phone ,address ,email ,password:hashedPassword})
              await newElectrician.save()


        
    .then(() => {
         req.flash("success", "Electrician added Successfully") 
         res.redirect("/admin/manageElectrician")
        
        })
    .catch((err) => {
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(error => error.message);
            req.flash("error", errors);
        }
        res.redirect("/admin/addElectrician");
    })
} catch (error) {
console.log(error)
}
}

exports.updateElectrician = async (req ,res) =>{
    const electricanId = req.params.id;
    const data = await Electrician.findById(electricanId);

    res.render("admin/pages/updateElectrician.ejs" , {"electrician":data})
}

exports.updateElectricianlogic = async (req , res) =>{
    try {
        const electricanId = req.params.id;
        let {first_name ,last_name , phone ,address  ,password} =req.body ; 
        await Electrician.findByIdAndUpdate(electricanId , {first_name ,last_name , phone ,address  ,password} ,{new:true})
    .then(() => {
         req.flash("success", "Electrician Updated Successfully") 
         res.redirect("/admin/manageElectrician")
        
        })
    .catch((err) => {
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(error => error.message);
            req.flash("error", errors);
        }
        res.redirect("/admin/manageElectrician")

    })
} catch (error) {
console.log(error)
}
}

exports.deleteElectrician = async (req ,res) =>{
    const electricanId = req.params.id;

    // Check if the provided ID is valid
    if (!mongoose.Types.ObjectId.isValid(electricanId)) {
        req.flash("error", "Invalid Electrician ID");
        return res.redirect("/admin/manageElectrician");
    }

    try {
        // Find and delete the service by ID
        const deleteElectrician = await Electrician.findByIdAndDelete(electricanId);

        if (!deleteElectrician) {
            // If no service is found with that ID
            req.flash("error", "Electrician not found");
            return res.redirect("/admin/manageElectrician");
        }

        req.flash("success", "Electrician removed successfully");
        res.redirect("/admin/manageElectrician");
    } catch (err) {
        // Handle any error that occurs during the deletion process
        console.log(err);
        req.flash("error", "Something went wrong");
        res.redirect("/admin/manageElectrician");
    }

}


exports.manageElectrician = async (req,res)=>{
    let data = await Electrician.find()
    res.render("admin/pages/manageElectrician.ejs" , {"electrician":data})
}

exports.addcategoryform = (req, res) => {
    res.render("admin/pages/addCategory.ejs")
}

exports.addcategorylogic = async (req, res) => {
    try {
        const { category_name } = req.body;
        const { path } = req.file;
        const newCategory = new Category({ category_name, category_image: path });
        await newCategory.save()
            .then(() => {
                 req.flash("success", "Category added Successfully")
                 res.redirect("/admin/manageCategory")
                
                })
            .catch((err) => {
                req.flash("error", "Category already Exists")
                res.redirect("/admin/addCategory")

            })
    } catch (error) {
        console.log(error)
    }
}

exports.managecategory = async (req,res)=>{
    const data = await Category.find();
    res.render("admin/pages/manageCategory.ejs",{'list':data})
}

exports.deletecategory = async (req, res) => {
    const categoryId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        req.flash("error", "Invalid category ID");
        return res.redirect("/admin/manageCategory");
    }
    try {
        const deletedCategory = await Category.findByIdAndDelete(categoryId);
        const deletedServices = await Service.deleteMany({category_name:deletedCategory.category_name})
        if (!deletedCategory) {
            req.flash("error", "Category not found");
            return res.redirect("/admin/manageCategory");
        }
        req.flash("success", "Category Removed Successfully");
        res.redirect("/admin/manageCategory");
    } catch (err) {
        req.flash("error", "Something went wrong");
        res.redirect("/admin/manageCategory");
    }
}

exports.addserviceform = async (req,res)=>{
    const data = await Category.find();
    res.render("admin/pages/addService.ejs" ,{"list":data})
}

exports.addservicelogic = async (req ,res) =>{
    try{
        const {service_name ,category_name ,price ,time ,description  } = req.body;
      let {path} = req.file;
        const newService = new Service({ service_name ,category_name ,service_image :path ,price ,time ,description  });
        await newService.save()
            .then(()=>{
                req.flash("success" , "Service added Successfully");
                res.redirect("/admin/manageService")

            })
            .catch((err)=>{ 
                console.log(err)
               req.flash("error",`Service already Exists :${err}`)
            res.redirect("/admin/addService")

            })
    }catch(error){
        console.log(error)
    }
}

exports.manageservice = async (req,res)=>{
    let service = await Service.find();
    res.render("admin/pages/manageService.ejs" , {list:service})
}

exports.serviceupdateform = async (req ,res)=>{
    const data = await Service.findById(req.params.id);
    let catry = await Category.find();
    let obj ={"list":data , "category":catry}
    res.render("admin/pages/updateServices.ejs", obj)
}

exports.serviceupdatelogic = async (req, res) => {
    try {
        const {  category_name, price, time, description } = req.body;
        const serviceId = req.params.id;  // Assuming the service ID is passed as part of the URL
        let { path } = req.file || {}; // Destructure 'path' safely, in case 'req.file' is undefined
        const serviceData = {
            category_name,price,time,description
        };
        if (path) {
            serviceData.service_image = path;
        }
        const updatedService = await Service.findByIdAndUpdate(serviceId, serviceData, { new: true });
        if (!updatedService) {
            return res.status(404).send('Service not found');
        }
        req.flash("success", "Service updated successfully");
        res.redirect("/admin/manageService");
    } catch (error) {
        req.flash("error", "An error occurred while updating the service");
        res.redirect("/admin/manageService");
    }
}


exports.deleteservice =async (req, res) => {
    const serviceId = req.params.id;

    // Check if the provided ID is valid
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        req.flash("error", "Invalid service ID");
        return res.redirect("/admin/manageService");
    }

    try {
        // Find and delete the service by ID
        const deletedService = await Service.findByIdAndDelete(serviceId);

        if (!deletedService) {
            // If no service is found with that ID
            req.flash("error", "Service not found");
            return res.redirect("/admin/manageService");
        }

        req.flash("success", "Service removed successfully");
        res.redirect("/admin/manageService");
    } catch (err) {
        // Handle any error that occurs during the deletion process
        console.log(err);
        req.flash("error", "Something went wrong");
        res.redirect("/admin/manageService");
    }
}



exports.assignElectrician = async (req, res) => {
    try {
        const orders = await Order.find({ electrician: null }).populate('user');
    
        // Step 1: Get electricians already assigned to active orders
        const activeOrders = await Order.find({ 
          status: { $nin: ['Completed', 'Cancelled'] },
          electrician: { $ne: null }
        });
    
        const busyElectricianIds = activeOrders.map(order => order.electrician.toString());
    
        // Step 2: Fetch electricians NOT in the busy list
        const electricians = await Electrician.find({
          _id: { $nin: busyElectricianIds }
        });
        res.render("admin/pages/assignElectrician.ejs" , { orders, electricians })

      } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
      }
    }
  



exports.assignElectricianLogic = async (req, res) => {
    const { orderId, electricianId } = req.body;
  
    try {
      const order = await Order.findById(orderId);
      const electrician = await Electrician.findById(electricianId);
  
      if (!order || !electrician) {
        return res.status(404).send('Order or Electrician not found');
      }
  
      order.electrician = electrician._id;
      order.status = 'Assigned';
      await order.save();
  
      res.redirect('/admin/assignElectrician');
    } catch (err) {
      res.status(500).send('Failed to assign electrician');
    }
  };


  exports.viewOrder = async (req ,res) =>{
    try {
        const orders = await Order.find()
          .populate('user')
          .populate('electrician')
          .sort({ createdAt: -1 }); // newest first
          res.render("admin/pages/viewOrder.ejs" , { orders })
    
      } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
      }
  }

  exports.manageOrder =  async (req, res) => {
    try {
      const orders = await Order.find()
        .populate('user')
        .populate('electrician')
        .sort({ createdAt: -1 }); // newest first
        res.render("admin/pages/manageOrder.ejs" , { orders })
  
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  };
  
  exports.updateOrder =async (req, res) => {
    const { orderId, status } = req.body;
  
    try {
      await Order.findByIdAndUpdate(orderId, { status });
      res.redirect('/admin/manageOrders');
    } catch (err) {
      console.error(err);
      res.status(500).send('Failed to update status');
    }
  }
  