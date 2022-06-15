const bodyParser = require('body-parser');
const express = require('express');
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 1337; //Default Port is leet.

const urlDataBase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.ca'
};

//////////////////////
// Helper Functions //
/////////////////////
const generateRandomString = () => {
  return Math.random().toString(36).slice(2,8) //Simplified generator found on https://stackoverflow.com/questions/10726909/random-alpha-numeric-string-in-javascript. 
}




////////////////
// Middleware //
////////////////
app.use(bodyParser.urlencoded({extended:true}))
app.use(cookieParser())

// SET View Engine
app.set('view engine', 'ejs');


////////////////
// GET ROUTES //
////////////////

// GET /
app.get('/', (req, res) => {
  res.redirect('/urls')
});

// GET /urls.json
app.get('/urls.json', (req, res) => {
  res.json(urlDataBase);
});

// GET /urls
app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDataBase,
    username: req.cookies['username']
  };
  res.render('urls-index', templateVars);
});

// GET /urls/new
app.get('/urls/new', (req, res) => {
  const templateVars = {username: req.cookies['username']}
  res.render('urls-new');
})

// GET /urls/:shortURL
app.get('/urls/:shortURL', (req, res)=>{
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL:urlDataBase[req.params.shortURL],
    username: req.cookies['username']
  }
  res.render('urls-show', templateVars)

})
//GET /u/:shortURL
app.get('/u/:shortURL', (req, res) => {
  res.redirect(`${urlDataBase[req.params.shortURL]}`)
})
// GET /hello
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

/////////////////
// POST ROUTES //
/////////////////

// POST /urls
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString()
  urlDataBase[shortURL] = req.body.longURL;
  console.log(urlDataBase) //Server-side log of accumulated database. 
  res.redirect(`/urls/${shortURL}`)
})

// POST /urls/delete/:shortURL
app.post('/urls/delete/:shortURL', (req,res) => {
  delete urlDataBase[req.params.shortURL];
  console.log(urlDataBase)
  res.redirect('/urls')

})

// POST /urls/edit/:shortURL
app.post('/urls/edit/:shortURL', (req,res) => {
    urlDataBase[req.params.shortURL] = req.body.newURL
    console.log(urlDataBase) //Server-side log of accumulated database. 
    res.redirect(`/urls/${req.params.shortURL}`)
})

// POST /login
app.post('/login', (req,res) =>{
  const userName = req.body.userName;
  res.cookie('username', userName)
  // console.log('cookies', req.cookies)
  console.log(req.body)
  console.log(req.cookies)
  res.redirect('/urls')
})

app.listen(PORT, () => {
  console.log(`The server is now running. Server is listening on Port${PORT}`);
});

