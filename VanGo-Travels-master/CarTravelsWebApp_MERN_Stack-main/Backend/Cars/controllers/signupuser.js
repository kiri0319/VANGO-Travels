const signupUsersData = require('../model/signupuser.js')
const asyncHandler = require('../middleware/asyncHandler.js');

const insertuserdata = asyncHandler(async(req,res,next) => {
    let postdata = await signupUsersData.create(req.body);
    console.log(postdata);
    res.status(201).json({success: true })
})

const findAllusersdata = asyncHandler(async(req,res, next) => {
    let Alldatas =await signupUsersData.find();
    res.json(Alldatas);
    console.log(Alldatas);
})

const findOneUserdata = asyncHandler(async(req,res,next)=>{
    let singleuser=await signupUsersData.find({emailid:req.params.emailid});
    if(singleuser.length !=0){
        res.json(singleuser[0]);
        console.log(singleuser[0]);}
    else throw new Error(`No record found for ${req.params.emailid}`)
})

const deleteuserdata = asyncHandler(async (req,res,next)=>{
    let del_data=await signupUsersData.deleteOne({emailid:req.params.emailid});
    if(del_data.n !== 0){
          res.status(201).json({success: "Successfully Deleted"})}
    else throw new Error(`No record found for ${req.params.emailid}`)
})

const updateuserdata = asyncHandler(async(req,res,next) => {
    try {
        const updatedUser = await signupUsersData.findOneAndUpdate(
            {emailid: req.params.emailid}, 
            { $set : {"username" :  req.body.username, "phonenumber" : req.body.phonenumber, "password": req.body.password} },
            { new: true, runValidators: true }
        );
        if(!updatedUser) {
            throw new Error(`No record found for ${req.params.emailid}`);
        }
        res.json({success:"Update Successful"});
    } catch(err) {
        next(err);
    }
})

const loginUser = asyncHandler(async(req, res)=>{
    const { emailid, password } = req.body || {};
    if(!emailid || !password){
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const user = await signupUsersData.findOne({ emailid });
    console.log('Signeduser', user);
    if(!user){
        return res.status(401).json({ success: false, message: 'Invalid username/password' });
    }
    const isMatch = await user.matchPassword(password);
    if(!isMatch){
        return res.status(401).json({ success: false, message: 'Invalid username/password' });
    }
    console.log("Generate Token -->".blue)
    const token = await user.generateToken();
    console.log("Generated token", token.green);
    res.json({ success: true, token });
})

module.exports = {insertuserdata,findAllusersdata,findOneUserdata,deleteuserdata,updateuserdata,loginUser};