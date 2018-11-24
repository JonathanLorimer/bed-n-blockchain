const express = require('express');
const app = express();
const PORT = 8000;

app.use(express.static('.'))

app.listen(PORT, function () {
  console.log('listening on port '+PORT)
})