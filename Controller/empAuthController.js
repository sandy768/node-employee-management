const EmpAuthModel=require('../Model/empAuthModel');
const bcrypt=require('bcryptjs');
const nodemailer=require('nodemailer');
const fs=require('fs');
const path=require('path');

// token setup
const TokenModel=require('../Model/tokenModel');
const jwt=require('jsonwebtoken');

// mail verification
const transporter=nodemailer.createTransport({
    host:'smtp',
    port:465,
    secure:false,
    requireTLS:true,
    service:'gmail',
    auth:{
        user:'sandiptomajumdar@gmail.com',
        pass:'hgmg sqwy nccp qxcx'
    }
})

const getEmpReg=(req,res)=>{
    let errEmail=req.flash("error");
    if(errEmail.length>0){
        errEmail=errEmail[0];
    }
    else{
        errEmail=null;
    }
    res.render('auth/empReg',{
        title:"Employee Registration Page",
        errorEmail:errEmail
    })
}
const postEmpReg=async(req,res)=>{
    try{
        let mail=req.body.email;
        let existing=await EmpAuthModel.findOne({email:mail});
        console.log(existing);
        if(!existing){
            let hashPassword=await bcrypt.hash(req.body.password,12);
            // console.log("After hashing the password",hashPassword); 
            let emp_images=req.files.map(images=>images.filename);
            let date=req.body.doj;
            let timestamp=new Date(date).getTime();
            let Day=new Date(timestamp).getDate();
            let Month=new Date(timestamp).getMonth() + 1;
            let Year=new Date(timestamp).getFullYear();
            let newDate=`${Day}/${Month}/${Year}`;
            // console.log(emp_images);
            let empData=new EmpAuthModel({
                full_name:req.body.name.toLowerCase(),
                email:req.body.email.toLowerCase(),
                contact:req.body.phn,
                address:req.body.address.toLowerCase(),
                state:req.body.state,
                zip:req.body.zip,
                password:hashPassword,
                date_of_joining:newDate,
                employee_images:emp_images,
            });
            let saveData=await empData.save();
            if(saveData){
                console.log("Employee details is saved successfully");
                const token_jwt=jwt.sign(
                    {email:req.body.email},
                    "secretkey8753427@secretkey8753427",
                    {expiresIn:"1h"}
                );
                const Token_data=new TokenModel({
                    token:token_jwt,
                    _userId:saveData._id,
                });
                let mailTransporter={
                    from:'sandiptomajumdar@gmail.com',
                    to:req.body.email,
                    subject:"Successful Registration",
                    text:'Hello'+" "+
                    req.body.name+
                    '\n\n'+
                    'You have successfully registered to our portal'+'\n\n'+
                    'http://'+
                    req.headers.host+
                    '/emplog/getdata/'+
                    req.body.email+
                    '/'+
                    token_jwt+
                    '\n\nThank you,\n'
                }
                transporter.sendMail(mailTransporter,function(error,info){
                    if(error){
                        console.log("Error to send mail",error);
                        res.redirect('/');
                    }
                    else{
                        console.log("Successfully send mail",info.response);
                        res.redirect('/emplog/getdata');
                    }
                })
            }
        }
        else{
            req.flash("error","Email alraedy exists");
            res.redirect('/');
        }
        
    }
    catch(err){
        console.log("Error while collecting data",err);
    }
}
const getEmpLog=(req,res)=>{
    let err_email=req.flash("error_mail");
    let err_password=req.flash("error_pass");
    if(err_email.length>0){
        err_email=err_email[0];
    }
    else{
        err_email=null;
    }
    if(err_password.length>0){
        err_password=err_password[0];
    }
    else{
        err_password=null;
    }
    res.render('auth/empLog',{
        title:"Login Page",
        error_email:err_email,
        error_password:err_password
    })
}
const postEmpLog=async(req,res)=>{
    // console.log("Login data:",req.body);
    try{
        let mail=req.body.email;
        let passkey=req.body.password;
        let exist_user=await EmpAuthModel.findOne({email:mail});
        // console.log(exist_user);
        if(!exist_user){
            req.flash("error_mail","Invalid Email");
            res.redirect('/emplog/getdata');
        }
        if(exist_user){
            let result=await bcrypt.compare(passkey,exist_user.password);
            if(result){
                req.session.isLoggedIn=true;
                req.session.user=exist_user;
                await req.session.save(err=>{
                    if(err){
                        console.log("Session saving error",err);
                    }
                    else{
                        res.redirect('/empdash/getdata');
                    }
                })
            }
            else{
                req.flash("error_pass","Incorrect Password");
                res.redirect('/emplog/getdata');
            }
        }
    }
    catch(err){
        console.log("Error while collecting login data",err);
    }
}
const getEmpDash=async (req,res)=>{
    try{
        let id=req.session.user._id;
        let user_info=await EmpAuthModel.findById(id);
        if(user_info){
            res.render('auth/empDashboard',{
                title:"Employee Profile",
                data:user_info
            })
        }
    }
    catch(err){
        console.log("Error to find user details",err);
    }
}
const getEmpEdit=async(req,res)=>{
    try{
        let id=req.session.user._id;
        let old_value=await EmpAuthModel.findById(id);
        if(old_value){
            res.render('auth/empEdit',{
                title:"Update User",
                data:old_value
            })
        }
    }
    catch(err){
        console.log("Error to find user data",err);
    }
}
const postEmpEdit=async(req,res)=>{
    try{
        console.log("Updated Values",req.body,req.files);
        // let user_id=req.body.uid;
        // let updated_images=req.files.map(img=>img.filename);
        // let updated_name=req.body.up_name.toLowerCase();
        // let updated_email=req.body.up_email;
        // let updated_contact=req.body.up_phn;
        // let updated_address=req.body.up_address.toLowerCase();
        // let updated_state=req.body.up_state.toLowerCase();
        // let updated_zip=req.body.up_zip;
        // let updated_password=req.body.up_password;
        // let updated_doj=req.body.up_doj;
        // let user_old_data=await EmpAuthModel.findById(user_id);
        
        // user_old_data.full_name=updated_name;
        // user_old_data.email=updated_email;
        // user_old_data.contact=updated_contact;
        // user_old_data.address=updated_address;
        // user_old_data.state=updated_state;
        // user_old_data.zip=updated_zip;
        // user_old_data.password=updated_password;
        // user_old_data.date_of_joining=updated_doj;
        // user_old_data.employee_images=updated_images;
        // let user_new_data=await user_old_data.save();
        // if(user_new_data){
        //     console.log("User data successfully updated");
        //     res.redirect('/empdash/getdata');
        // }
    }
    catch(err){
        console.log("Error to collect data",err);
    }
}
const getEmpDelete=async(req,res)=>{
    try{
        let u_id=req.params.id;
        let del_user=await EmpAuthModel.findOneAndDelete({_id:u_id});
        // console.log("Deleted user",del_user);
        await req.session.destroy();
        if(del_user){
            del_user.employee_images.forEach((file)=>{
                let filePath=path.join(__dirname,"..","uploads","auth",file);
                fs.unlinkSync(filePath);
            })
            res.redirect('/');
        }
    }
    catch(err){
        console.log("Error while deleting data",err);
    }
}
const empDashLogout=async(req,res)=>{
    await req.session.destroy();
    res.redirect('/emplog/getdata');
}
module.exports={
    getEmpReg,
    postEmpReg,
    getEmpLog,
    postEmpLog,
    getEmpDash,
    getEmpEdit,
    postEmpEdit,
    getEmpDelete,
    empDashLogout
}