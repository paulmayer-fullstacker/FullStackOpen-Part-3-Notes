// index.js

require('dotenv').config() // dotenv LINE FIRST
const express = require('express')
const morgan = require('morgan'); // Require morgan
const app = express()
const cors = require('cors')
const { v4: uuidv4 } = require('uuid'); // Import the UUID v4 generator

let notes = [
  {
    id: '1',
    content: 'HTML is easy',
    important: true,
  },
  {
    id: '2',
    content: 'Browser can execute only JavaScript',
    important: false,
  },
  {
    id: '3',
    content: 'GET and POST are the most important methods of HTTP protocol',
    important: true,
  },
]

// // CORS: Define the specific origin(s) allowed
// const allowedOrigins = [
//   'http://localhost:5173' // Your frontend URL
// ]

// // CORS configuration options
// const corsOptions = {
//   origin: function (origin, callback) {
//     // Check if the request origin is in the allowedOrigins array
//     // Allow requests with no origin (like mobile apps or server-to-server requests)
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed HTTP methods
//   credentials: true, // Allow cookies to be sent
//   optionsSuccessStatus: 204 // Some legacy browsers (IE11, various SmartTVs) choke on 204
// }

// // Apply CORS middleware with the specific options
// app.use(cors(corsOptions));

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(cors())  // Apply CORS first
app.use(express.json())
app.use(requestLogger)
app.use(morgan('tiny')) // Use morgan middleware with the 'tiny' format string. This will log minimal information to the console for every request.
app.use(express.static('dist'))

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response) => {
  response.json(notes)
})

app.get('/api/notes/:id', (request, response) => {
  const id = request.params.id
  const note = notes.find((note) => note.id === id)

  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
})
// Removed in favour of UUID
// const generateId = () => {
//   const maxId =
//     notes.length > 0 ? Math.max(...notes.map((n) => Number(n.id))) : 0
//   return String(maxId + 1)
// }

app.post('/api/notes', (request, response) => {
  const body = request.body

  if (!body.content) {
    return response.status(400).json({
      error: 'content missing',
    })
  }

  const note = {
    content: body.content,
    important: body.important || false,
    id: uuidv4(),  // Use uuidv4() to generate a unique string ID
  }

  notes = notes.concat(note)

  response.json(note)
})

app.delete('/api/notes/:id', (request, response) => {
  const id = request.params.id
  notes = notes.filter((note) => note.id !== id)

  response.status(204).end()
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})