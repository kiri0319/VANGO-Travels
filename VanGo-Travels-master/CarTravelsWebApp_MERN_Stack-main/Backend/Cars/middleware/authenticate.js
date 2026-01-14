const asyncHandler = require('./asyncHandler.js')
const jwt = require('jsonwebtoken');

const protect =  asyncHandler(async (req, res, next)=> {
    const authHeader = req.headers.authorization;
    console.log("authHeader".bold,authHeader)
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        console.log('token after split: '.bgBlue + token);
        let tokenvalue = 'mytravelsapp'
        let user = await jwt.verify(token,tokenvalue);
        if(!user) throw new Error('Invalid token!!') 
        console.log("user".bgBlue,user);
        req.user = user;
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'No token provided'
        });
    }
})


const authorize_role = (...roles) => {
    return (req, res, next)=> {
        console.log("Allowed roles:".bold +roles)
        console.log('User role: '.bold + req.user.role)
        if(roles.includes(req.user.role)){
            next();
        }
        else{
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        } 
    }
}

module.exports = {protect,authorize_role};