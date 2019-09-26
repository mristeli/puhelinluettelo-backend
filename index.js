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
// let persons = [
//   {
//     "name": "Arto Hellas",
//     "number": "040-123456",
//     "id": 1
//   },
//   {
//     "name": "Ada Lovelace",
//     "number": "39-44-5323523",
//     "id": 2
//   },
//   {
//     "name": "Dan Abramov",
//     "number": "12-43-234345",
//     "id": 3
//   }
// ]

app.get('/api/persons', (request, response) => {
  Contact.find({}).then(contacts => {
    response.json(contacts)
  })
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(p => p.id === id)
  if(person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(p => p.id !== id)
  response.status(204).end()
})


app.post('/api/persons', (request, response) => {
  const body = request.body
  if(!body.name || !body.number) {
    return response.status(400).json({
        error: `${body.name ? 'Number' : 'Name'}  is missing`
    })
  } // else if (persons.find(n => n.name === body.name)) {
  //   return response.status(400).json({
  //       error: 'Name must be unique'
  //   })
  // }

  const contact = new Contact({
    ...body, date: new Date()
  })
  contact.save().then(response => {
    response.json(response)
  })
})

app.get('/info', (request, response) => {
  response.send('<html><head></head><body>' 
    + `<p>Phonebook has info for ${persons.length} people<p>` 
    + `<p>${new Date()}</p>`
    + '</body></html>').end()
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
