require('dotenv').config()

const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const app = express()

const Person = require('./models/person')

morgan.token('body', function getBody(request) {
  return JSON.stringify(request.body)
})

app.use(express.json())
app.use(express.static('build'))
app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// Ever since MongoDB Atlas exists, this thing has been useless.
let persons = [
  {
    'i': 1,
    'name': 'Arto Hellas',
    'number': '040-123456'
  },
  {
    'id': 2,
    'name': 'Ada Lovelace',
    'number': '39-44-5323523'
  },
  {
    'id': 3,
    'name': 'Dan Abramov',
    'number': '12-43-234345'
  },
  {
    'id': 4,
    'name': 'Mary Poppendieck',
    'number': '39-23-6423122'
  }
]

app.get('/', (_request, response) => {
  response.send('<h1>Hello world!</h1>')
})

app.get('/api/persons', (_request, response, next) => {
  Person.find({})
    .then(persons => {
      response.json(persons)
    })
    .catch(error => next(error))
})

app.get('/info', (_request, response, next) => {
  const date = new Date().toUTCString()
  Person.countDocuments({}).then(count => {
    response.send(
      `<p>Phonebook has info for ${count} people.</p>
      <p>${date}</p>`
    )
  }).catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      response.json(person)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

// Maybe replace put with update?
app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(request.params.id,
    { name, number }, { new: true, runValidators: true, context: 'query' })
    .then(person => {
      response.json(person)
    })
    .catch(error => next(error))
})

// Okay, so that did not work. Also, we need to fix the delete part as well.
// Deleting a contact does not work at all.

// Since AtlasDB assigns ids automatically, this is no longer needed.
const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(person => person.id))
    : 0
  return Math.floor(Math.random() * maxId ** 2) + maxId
}

// Essentially this is 3.19 is all about.
app.post('/api/persons', (request, response, next) => {
  const body = request.body
  var cond = true

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  // I think we do some forEach here.
  persons.forEach(person => {
    if (JSON.stringify(person.name) === JSON.stringify(body.name)) {
      cond = false
      return response.status(400).json({
        error: 'name must be unique'
      })
    }
  })

  const person = new Person({
    id: generateId(),
    name: body.name,
    number: body.number
  })

  if (cond) {
    person.save().then(savedPerson => {
      console.log('Person saved!')
      response.json(savedPerson)
    }).catch(error => {
      console.log(error.message)
      next(error)
    })
  }
})

// Not too sure about 3.16. For every ".then" I just add a ".catch". Then I add
// const errorHandler. Not even sure what errorHandler does, but okay.
// Also not too sure about ValidationError. How many Errors are there?
const errorHandler = (error, _request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Malformatted id.' })
  } else if (error.name === 'ValidationError') {
    // May want to change into error: error.message.
    return response.status(400).send({ error: error.message })
  }

  next(error)
}

// This has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)