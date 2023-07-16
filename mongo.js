const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://fullstack:${password}@cluster0.fogxktw.mongodb.net/?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

// MongoDB assigns ids randomly so I won't be including it for now.
// Oh boy, guess we have to do it the traditional if else way.
// Please, let 3.19 work.
// Wait a second, so this schema thing does not even work?
const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

// Now the real fight begins.
// 3.13 and 3.14 seem like a pain to deal with.

// 3.13:
// Change the fetching of all phonebook entries so that the data is fetched from the database.
// Verify that the frontend works after the changes have been made.

// 3.14:
// Change the backend so that new numbers are saved to the database. Verify that your frontend still works after the changes.
// At this stage, you can ignore whether there is already a person in the database with the same name as the person you are adding.

// Adding people to database.
if (process.argv.length === 5) {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4]
  })

  person.save().then(result => {
    console.log(`added ${process.argv[3]} number ${process.argv[4]} to phonebook`)
    mongoose.connection.close()
  })

// Display all entries.
// Oh god this part is literally the hardest. Fuck MongoDB.
} else if (process.argv.length === 3) {
  //var allEntries = "phonebook:"

  Person.find({}).then(result => {
    console.log("phonebook:")
    result.forEach((person) => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
}