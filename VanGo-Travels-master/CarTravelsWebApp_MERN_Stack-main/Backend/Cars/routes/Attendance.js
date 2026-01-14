var express = require('express')
var router = express.Router()
const query_find = require('../middleware/query_params.js');
const {protect,authorize_role} = require('../middleware/authenticate.js');
const Users_Log = require('../model/Attendance.js');
const {findAlluserlog,insertuserlog,findOneUserLog,updateUserLog} = require('../controllers/Attendance.js')

router.route('/')
.get(query_find(Users_Log),findAlluserlog)
.post(insertuserlog)

router.route('/:user')
.get(findOneUserLog)

router.route('/:_id')
.patch(protect,updateUserLog)
 

module.exports = router

// .patch(protect,authorize_role('user','admin'),updateuser)
// router.route('/:user')
// .get(protect,authorize_role('user','admin'),findOneUser)

// router.route('/:_id')
// .delete(protect,authorize_role('user'),deleteuser)