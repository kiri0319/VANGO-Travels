const adminHomePageDataSchema = require('../model/Adminhomepage.js')
const asyncHandler = require('../middleware/asyncHandler.js');

const insertpackage = async(req,res,next) => {
    try{
        let postNewDetail = await adminHomePageDataSchema.create(req.body);
        console.log(postNewDetail);
        res.status(201).json({success: "Added Sucessfully"})}
    catch(err){next(err);}
}

const findAllpackages = asyncHandler(async(req, res)=>{
    try {
        const { sort } = req.query;
        let query = {};
        let sortOption = {};
        
        if(sort) {
            sortOption = { [sort]: 1 };
        }
        
        const packages = await adminHomePageDataSchema.find(query).sort(sortOption);
        res.status(200).json({ success: true, data: packages });
    } catch(err) {
        next(err);
    }
})

const findonepackage = async (req,res,next)=>{
    try{
        if(req.params.packagenameid.length === 1){
            let noofdays = req.params.packagenameid;
            let searchData=await adminHomePageDataSchema.find({noofdays : noofdays});
            if(searchData.length !=0){
                res.json(searchData);
                console.log(searchData);}
            else next({message:"no record found"});
        }else{
            let searchData=await adminHomePageDataSchema.find({packagenameid : req.params.packagenameid});
            if(searchData.length !=0){
                res.json(searchData[0]);
                console.log(searchData[0]);}
            else next({message:"no record found"});
        }
    }
    catch(err) {next(err);}
}

const deletepackage = async (req,res,next)=>{
    try{
        let Deletedata=await adminHomePageDataSchema.deleteOne({packagenameid:req.params.packagenameid});
        console.log(Deletedata);
        if(Deletedata.n !== 0){
            res.status(201).json({success: "Sucessfully Deleted"});}
        else next({message:"no record found"});
    }
    catch(err) {next(err);}
}

const updatepackage = async(req,res,next) => {
    adminHomePageDataSchema.findOneAndUpdate({packagenameid: req.params.packagenameid}, { $set : {"packagename" :  req.body.packagename, "packagedetails" : req.body.packagedetails, "packageprice": req.body.packageprice, "packageimage":req.body.packageimage,"noofdays":req.body.noofdays,"carType":req.body.carType} }, (err, doc)=>{
        if(err) next(err);
        res.json({success:"Updated Successfully"});
    })
}

const insertBulkPackages = async(req,res,next) => {
    try{
        // Validate that we have an array of packages
        if(!Array.isArray(req.body) || req.body.length === 0){
            return res.status(400).json({success: false, message: "Please provide an array of packages"});
        }

        // Validate each package has required fields
        for(let package of req.body){
            if(!package.packagenameid || !package.packagename || !package.packagedetails || !package.packageprice){
                return res.status(400).json({success: false, message: "Each package must have packagenameid, packagename, packagedetails, and packageprice"});
            }
        }

        // Insert all packages
        let insertedPackages = await adminHomePageDataSchema.insertMany(req.body);
        console.log(`Inserted ${insertedPackages.length} packages successfully`);
        res.status(201).json({success: true, message: `Successfully inserted ${insertedPackages.length} packages`, data: insertedPackages});
    }
    catch(err){
        console.error('Bulk insert error:', err);
        next(err);
    }
}


module.exports = {insertpackage,findAllpackages,findonepackage,deletepackage,updatepackage,insertBulkPackages};

// const findAllpackages = async(req,res, next) => {
//     try{
//         let allHomeMainData =await adminHomePageDataSchema.find();
//         res.json(allHomeMainData);
//         console.log(allHomeMainData);}
//     catch(err) {next(err);}
// }

// const findonepackageBasedOnDays = async (req,res,next)=>{
//     try{
//         let searchData=await adminHomePageDataSchema.find({noofdays : req.params.noofdays});
//         if(searchData.length !=0){
//             res.json(searchData);
//             console.log(searchData);}
//         else next({message:"no record found"});
//     }
//     catch(err) {next(err);}
// }
