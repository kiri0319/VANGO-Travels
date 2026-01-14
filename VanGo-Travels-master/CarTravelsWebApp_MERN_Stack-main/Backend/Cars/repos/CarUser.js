// const CarBookedUsersData = require('../model/CarUser.js')

// function insertuser(user, fn){
//     console.log('Insert Data....')
//     let userObj = new CarBookedUsersData();
//     userObj.name = user.name
//     userObj.phoneNumber = user.phoneNumber
//     userObj.FromLocation = user.FromLocation
//     userObj.ToLocation = user.ToLocation
//     userObj.DateTime = user.DateTime

//     userObj.save((err)=>{
//         //if(err) throw err;
//         fn(err);
//     })
// }

// function findAllusers(fn){
//     console.log('Getting All user Data....')
//     CarBookedUsersData.find({}, (err,docs)=>{
//         if(err) throw err;
//         fn(docs);
//     })
// }
// function findOneUser(name,fn){
//     console.log('Getting One User Data....')
//     CarBookedUsersData.find({name}, (err,docs)=>{
//         if(err) throw err;
//         fn(docs);
//     })
// }

// function deleteuser(name, fn) {
//     console.log('Delete Data....')
//     CarBookedUsersData.deleteOne({name}, (err)=>{
//        // if(err) throw err;
//         fn(err);
//     })
// }

// function updateuser(user, fn){
//     console.log('Update Data....')
//     CarBookedUsersData.updateOne({ name: user.name }, { $set : {"phoneNumber" : user.phoneNumber, "FromLocation" : user.FromLocation, "ToLocation": user.ToLocation, "DateTime":user.DateTime} }, function(err, res) {
//         //if(err) throw err;
//         fn(err);
//     });
// }

// module.exports = {insertuser,findAllusers, deleteuser, updateuser, findOneUser }