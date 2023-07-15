// Not sure how this will play out, but okay.
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI
console.log('Connecting to', url)

mongoose.connect(url)
  .then(result => {
    console.log('Connected to MongoDB')
  })
  .catch(error => {
    console.log('Error connecting to MongoDB:', error.message)
  })

// 3.20 should lie in here.
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: [3, 'Username must have length of 3 or more!'],
    required: [true, 'Username required']
  },
  number:{
    type: String,
    minLength: [8, 'Phone number must have length of 8 or more!'],
    validate: {
      validator: function(v) {
        return /^(\d){2,3}(-)(\d)*$/.test(v)
      },
      message: props => `${props.value} is not a valid phone number!`
    },
    required: [true, 'User phone number required']
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)