const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CarKmPriceDataSchema = new Schema({
   vechicleid:  {
                  'type': String,
                  'uppercase': true,
                  'minLength' : [3,'Vehicle ID should not be less than 3 characters'],
                  // 'maxLength' : [30,'name should not be greater than 30 character'],
                   required : [true, 'Vehicle ID is mandatory'],
                   'trim': true,
                   'unique':true
                },
   vechicle:     {'type': String,
                   'uppercase': true,
                   'minLength' : [3,'Vehicle name should not be less than 3 characters'],
                  //  'maxLength' : [30,'name should not be greater than 30 character'],
                    required : [true, 'Vehicle name is mandatory'],
                   'trim': true
                  },
   minkm:         {'type': Number,
                  required : [true, 'Minimum kilometers is mandatory'],
                  },
   rateperkm:      {'type': Number, 
                     required : [true, 'Rate per kilometer is mandatory']
                   },
   driverallowance:{'type': Number
                   },
   amount:        {'type': Number, 
                    required : [true, 'Amount is mandatory']
                  },
   imageUrl:     {
                    type: String, // relative URL or path to uploaded image
                    default: ''
                  }           
  });


const CarKmPriceData = mongoose.model('CarKmPriceData', CarKmPriceDataSchema);

module.exports = CarKmPriceData;