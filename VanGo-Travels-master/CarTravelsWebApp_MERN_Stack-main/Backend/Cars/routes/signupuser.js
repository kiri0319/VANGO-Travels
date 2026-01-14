var express = require('express')
var router = express.Router()
const {protect,authorize_role} = require('../middleware/authenticate.js');

const {findAllusersdata,insertuserdata,findOneUserdata,deleteuserdata,updateuserdata,loginUser} = require('../controllers/signupuser.js')

router.route('/')
.get(protect,authorize_role('admin'),findAllusersdata)
.post(insertuserdata)

router.route('/:emailid')
.get(protect,authorize_role('admin','user'),findOneUserdata)
.delete(protect,authorize_role('user'),deleteuserdata)
.patch(protect,authorize_role('user'),updateuserdata)

router.route('/loginuser')
.post(loginUser)

module.exports = router