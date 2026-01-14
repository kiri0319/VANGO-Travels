const Car_user_AttendancData = require('../model/Attendance.js')
const asyncHandler = require('../middleware/asyncHandler.js');

const insertuserlog = async(req,res,next) => {
    try{
        let postNewDetail = await Car_user_AttendancData.create(req.body);
        console.log(postNewDetail);
        res.status(201).json({success: "Added Sucessfully"})}
    catch(err){next(err);}
}

const findAlluserlog = asyncHandler(async(req, res)=>{
    try {
        const userLogs = await Car_user_AttendancData.find().populate('user', 'username emailid');
        res.status(200).json({ success: true, data: userLogs });
    } catch(err) {
        next(err);
    }
})


const findOneUserLog = asyncHandler(async(req,res,next)=>{
    let Userlogdata = await Car_user_AttendancData.find({user:req.params.user});
    if(Userlogdata.length !=0){
        res.json(Userlogdata);
        console.log(Userlogdata);}
    else throw new Error(`No record found for ${req.params.user}`)
})

const updateUserLog = async(req,res,next) => {
        Car_user_AttendancData.findOneAndUpdate({ _id: req.params._id}, { $set : {"loggedoutAt" :  req.body.loggedoutAt, "status" : req.body.status } }, (err, doc)=>{
            if(err) next(err);
            res.json({success:"Updated Successfully"});
        })
    }

module.exports = {insertuserlog,findAlluserlog,findOneUserLog,updateUserLog};



// const findonepackage = async (req,res,next)=>{
//     try{
//         let searchData=await Car_user_AttendancData.find({packagenameid : req.params.packagenameid});
//         if(searchData.length !=0){
//             res.json(searchData[0]);
//             console.log(searchData[0]);}
//         else next({message:"no record found"});
//     }
//     catch(err) {next(err);}
// }
// const deletepackage = async (req,res,next)=>{
//     try{
//         let Deletedata=await Car_user_AttendancData.deleteOne({packagenameid:req.params.packagenameid});
//         console.log(Deletedata);
//         if(Deletedata.n !== 0){
//             res.status(201).json({success: "Sucessfully Deleted"});}
//         else next({message:"no record found"});
//     }
//     catch(err) {next(err);}
// }

// const updatepackage = async(req,res,next) => {
//     Car_user_AttendancData.findOneAndUpdate({packagenameid: req.params.packagenameid}, { $set : {"packagename" :  req.body.packagename, "packagedetails" : req.body.packagedetails, "packageprice": req.body.packageprice, "packageimage":req.body.packageimage,"noofdays":req.body.noofdays,"carType":req.body.carType} }, (err, doc)=>{
//         if(err) next(err);
//         res.json({success:"Updated Successfully"});
//     })
// }

// module.exports = {insertuserlog,findAlluserlog,findonepackage,deletepackage,updatepackage};
