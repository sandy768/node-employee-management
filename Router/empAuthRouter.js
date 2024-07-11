const express=require('express');
const router=express.Router();
const multer=require('multer');
const path=require('path');

const {getEmpReg,postEmpReg,getEmpLog,postEmpLog,getEmpDash,getEmpEdit,postEmpEdit,getEmpDelete,empDashLogout}=require('../Controller/empAuthController');

const fileStorage=multer.diskStorage({
    destination:(req,file,callback)=>{
        callback(null,path.join(__dirname,"..","uploads","auth"),(err,data)=>{
            if(err) throw err;
        });
    },
    filename:(req,file,callback)=>{
        callback(null,file.originalname,(err,data)=>{
            if(err) throw err;
        });
    }
})
const fileFilter=(req,file,callback)=>{
    if(
        file.mimetype.includes("png")||
        file.mimetype.includes("jpg")||
        file.mimetype.includes("jpeg")||
        file.mimetype.includes("webp")||
        file.mimetype.includes("jfif")
    ){
        callback(null,true);
    }else{
        callback(null,false);
    }
}
const upload=multer({
    storage:fileStorage,
    fileFilter:fileFilter,
    limits:{fieldSize:1024*1024*5}
})
const upload_type=upload.array('emp_img',3);

router.get('/',getEmpReg);
router.post('/empreg/postdata',upload_type,postEmpReg);
router.get('/emplog/getdata',getEmpLog);
router.post('/emplog/postdata',postEmpLog);
router.get('/empdash/getdata',getEmpDash);
router.get('/empedit/getdata',getEmpEdit);
router.post('/empedit/postdata',upload_type,postEmpEdit);
router.get('/empdelete/getdata/:id',getEmpDelete);
router.get('/empdash/logout',empDashLogout);

module.exports=router;
