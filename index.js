require('dotenv').config()
const express = require('express')
const app = express() 
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Contact = require('./models/contact')

app.use(cors())
app.use(bodyParser.json())
app.use(express.static('build'))

morgan.token('postdata', function (req, res) { 
  return req.method === 'POST' 
    ? JSON.stringify(req.body)
    : ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postdata'))

app.get('/api/persons', (request, response) => {
  Contact.find({}).then(contacts => {
    response.json(contacts)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Contact.findById(request.params.id)
    .then(contact => {
      if(contact) {
        response.json(contact)
      } else {
        response.status(404).end()
      }
    }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Contact.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  if(!body.name || !body.number) {
    return response.status(400).json({
        error: `${body.name ? 'Number' : 'Name'}  is missing`
    })
  }

  const contact = new Contact({
    name: body.name,
    number: body.number
  })
  contact.save().then(savedContact => {
    response.json(savedContact)
  }).catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const contact = {
    name: body.name,
    number: body.number
  }
  Contact.findByIdAndUpdate(request.params.id, contact, { new: true})
    .then(updatedNote => {
      if(updatedNote) {
        response.json(updatedNote)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
  Contact.countDocuments({})
    .then(result => {
      response.send('<html><head></head><body>' 
        + `<p>Phonebook has info for ${result} people<p>` 
        + `<p>${new Date()}</p>`
        + '</body></html>').end()
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log(error.message);
  
  if(error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
