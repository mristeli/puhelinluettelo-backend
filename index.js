const express = require('express')
const app = express() 
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

app.use(cors())
app.use(bodyParser.json())

morgan.token('postdata', function (req, res) { 
  return req.method === 'POST' 
    ? JSON.stringify(req.body)
    : ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postdata'))

let persons = [
  {
    "name": "Arto Hellas",
    "number": "040-123456",
    "id": 1
  },
  {
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
    "id": 2
  },
  {
    "name": "Dan Abramov",
    "number": "12-43-234345",
    "id": 3
  }
]

app.get('/api/persons', (request, response) => {
  response.json(persons)
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


const generateId = () => {
  return Math.floor(Math.random() * 10**9)
}

app.post('/api/persons', (request, response) => {
  const body = request.body
  if(!body.name || !body.number) {
    return response.status(400).json({
        error: `${body.name ? 'Number' : 'Name'}  is missing`
    })
  } else if (persons.find(n => n.name === body.name)) {
    return response.status(400).json({
        error: 'Name must be unique'
    })
  }

  const person = {
    ...body,
    id: generateId()
  }
  persons = persons.concat(person)
  response.json(person)
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


const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})