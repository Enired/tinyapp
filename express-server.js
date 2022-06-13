const express = require('express');
const app = express();
const PORT = 1337; //Default Port is leet.

const urlDataBase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.ca'
};

app.get('/', (req, res) => {
  res.send('Hello friend!');
});

app.listen(PORT, () => {
  console.log(`The server is now running. Server is listening on Port${PORT}`);
});