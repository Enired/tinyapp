const express = require('express');
const app = express();
const PORT = 1337; //Default Port is leet.

const urlDataBase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.ca'
};


// SET View Engine
app.set('view engine', 'ejs');

// GET /
app.get('/', (req, res) => {
  res.send('Hello friend!');
});

// GET /urls.json
app.get('/urls.json', (req, res) => {
  res.json(urlDataBase);
});

// GET /urls
app.get('/urls', (req, res) => {
  const templateVars = {urls: urlDataBase};
  res.render('urls-index', templateVars);
});

// GET /urls/new
app.get('/urls/new', (req, res) => {
  res.render('urls-new');
})

// GET /urls/:shortURL
app.get('/urls/:shortURL', (req, res)=>{
  const templateVars = {shortURL: req.params.shortURL, longURL:urlDataBase[req.params.shortURL]}
  res.render('urls-show', templateVars)

})


// GET /hello
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`The server is now running. Server is listening on Port${PORT}`);
});