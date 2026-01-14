const mongoose = require('mongoose');
var colors = require('colors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Schema = mongoose.Schema;
const signupuserDataSchema = new Schema({
    username:  {'type': String,
                'uppercase': true,
                'minLength' : [3,'name should not be less than 3 character'],
                'maxLength' : [20,'name should not be greater than 20 character'],
                required : [true, 'Provide a Unique UserId/UserName'],
                'trim': true,
                'unique':true
                },
    emailid:    {'type': String,
                  match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
                  required : [true, 'Provide a Unique Email-Id'],
                  'trim': true,
                  'unique':true
                },
    phonenumber: {'type': String,
                 'match': [/^(\+94\d{9}|0\d{9})$/, 'Please enter a valid Sri Lankan phone number (+94XXXXXXXXX or 0XXXXXXXXX)'],
                  required : [true, 'Provide a phone number.. It is mandatory'],
                  'trim': true
                },
    password:   {'type': String,
                 'trim': true,
                 'minLength' : [8,'name should not be less than 8 character'],
                 'maxLength' : [20,'name should not be greater than 20 character'],
                 required : [true, 'Provide a Password.. It is mandatory']
                },
    role:      {
                  type: String,
                  enum: ['user','admin'],
                  default: 'user'
                },
    signeddate : {"type": String,
                  default :  new Date().toLocaleString()
    }
  });


signupuserDataSchema.methods.generateToken = async function(){
    let user = {id: this._id, role: this.role, emailid: this.emailid, username: this.username};
    let tokenvalue = 'mytravelsapp'
    console.log("token_user",user);
    let token = await jwt.sign(user,tokenvalue);
    console.log("token->",token)
    return token;
}

signupuserDataSchema.methods.matchPassword = async function(enteredPassword){
    console.log("currentpassword  => ".magenta,enteredPassword);
    return await bcrypt.compare(enteredPassword, this.password);
}

signupuserDataSchema.pre('save', async function() {
    let salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt)
  });

const signupuserData = mongoose.model('signupuserData', signupuserDataSchema);

module.exports = signupuserData;