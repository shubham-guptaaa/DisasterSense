import express from "express"
import cors from "cors"
import { Server } from "socket.io"
import http from "http"

// Import routes
import disasterRoutes from './routes/disaster.routes.js'
import alertRoutes from './routes/alert.routes.js'
import simulationRoutes from './routes/simulation.routes.js'

// Import services
import dataStreamService from './services/dataStream.service.js'

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*", // Replace with frontend URL.
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
})

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/disasters', disasterRoutes)
app.use('/api/alerts', alertRoutes)
app.use('/api/simulate', simulationRoutes)

// Socket.io connection
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id)
  
  socket.on("join-disaster-feed", (disasterType) => {
    socket.join(disasterType)
    console.log(`Client ${socket.id} joined ${disasterType} feed`)
  })
  
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id)
  })
})

// Initialize services
dataStreamService.init()

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "Server is healthy" })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: "Internal server error" })
})

export { app, server, io }