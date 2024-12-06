const express = require('express');
const path = require('path');
const app = express();

// Middleware untuk file statis
app.use(express.static(path.join(__dirname, 'public')));

// Rute root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Jalankan server
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

module.exports = app;
