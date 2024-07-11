const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const EmpSchema=new Schema({
    full_name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    contact:{
        type:Number,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    zip:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    date_of_joining:{
        type:String,
        required:true
    },
    employee_images:{
        type:[String],
        required:false
    }
},{
    timestamps:true,
    versionKey:false,
});

const EmpModel=new mongoose.model('details',EmpSchema);
module.exports=EmpModel;
