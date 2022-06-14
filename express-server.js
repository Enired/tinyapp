const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const PORT = 1337; //Default Port is leet.

const urlDataBase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.ca'
};

const generateRandomString = () => {
  return Math.random().toString(36).slice(2,8) //Simplified generator found on https://stackoverflow.com/questions/10726909/random-alpha-numeric-string-in-javascript. 
}


// SET View Engine
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.urlencoded({extended:true}))

//ROUTES
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

// POST /urls
app.post('/urls', (req, res) => {
  console.log(req.body);
  res.send('Ok!')
})

app.listen(PORT, () => {
  console.log(`The server is now running. Server is listening on Port${PORT}`);
});

