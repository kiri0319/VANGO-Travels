const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Car_user_AttendanceDataSchema = new Schema({
    user:       {'type': mongoose.Schema.Types.ObjectId,
                 ref: 'signupuserData',
                 required: [true,"Provide a Object Id It is mandatory"]
    },  
    loggedinAt: {'type': String
    },
    loggedoutAt: {'type': String
    },
    status:     {'type': String,
                 enum : ['IN','OUT']
    },           
  });

const Car_user_AttendancData = mongoose.model('Car_user_AttendancData', Car_user_AttendanceDataSchema);

module.exports = Car_user_AttendancData;