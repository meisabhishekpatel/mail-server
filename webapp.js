const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { emails } = require("./index.js"); // Import emails from SMTP server

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files
app.use(express.static("public"));

// API to fetch all received emails
app.get("/emails", (req, res) => {
  res.json(emails);
});

// Real-time socket.io connection
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Send the latest emails when a client connects
  socket.emit("emails", emails);
});

// Start the web server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Web app running on http://localhost:${PORT}`);
});

module.exports = { io };
