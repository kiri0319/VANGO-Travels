var express = require('express')
var router = express.Router()
const {protect,authorize_role} = require('../middleware/authenticate.js');
const path = require('path')
const multer = require('multer')

const {insertdetail,findAlldetails,findOnedetail,deletedetail,updatedetail} = require('../controllers/CarKmPrice.js')

// Multer storage for car images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads', 'car-images'))
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname)
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '')
    const unique = Date.now()
    cb(null, `${base}-${unique}${ext}`)
  }
})
const upload = multer({ storage })

router.route('/')
.get(protect,authorize_role('admin','user','driver'),findAlldetails)
.post(protect,authorize_role('admin'), upload.single('image'), insertdetail)

router.route('/:vechicleid')
.get(protect,authorize_role('admin','user','driver'),findOnedetail)
.delete(protect,authorize_role('admin'),deletedetail)
.patch(protect,authorize_role('admin'), upload.single('image'), updatedetail)

module.exports = router