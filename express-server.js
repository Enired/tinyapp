const bodyParser = require('body-parser');
const express = require('express');
const app = express();

const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const {getUserFromDataBase} = require('./helpers');

const PORT = 1337; //Default Port is leet.

//////////
// Data //
//////////

// Url Database
const urlDataBase = {
  'b2xVn2': {
    longURL:'http://www.lighthouselabs.ca',
    userID:'db0913'},
  '9sm5xK': {
    longURL:'http://www.google.ca',
    userID:'bl0819'}
};

// User Database
const userDataBase = {
  'db0913': {id:'db0913', email: 'a@a.com', password: '$2a$10$oqO8MbfYT1CnADwmn5qaqe3jiuQPBanGHG0NYsQXxQnZDGp3ubxqy'},
  'bl0819': {id:'bl0819', email: 'b@b.com', password: '$2a$10$oqO8MbfYT1CnADwmn5qaqe3jiuQPBanGHG0NYsQXxQnZDGp3ubxqy'}

};

//////////////////////
// Helper Functions //
/////////////////////

// Generate string for shortened links
const generateRandomString = () => {
  return Math.random().toString(36).slice(2,8); //Simplified generator found on https://stackoverflow.com/questions/10726909/random-alpha-numeric-string-in-javascript.
};


const urlsForUser = (id) =>{
  const filteredDataBase = {};
  for (const url in urlDataBase) {
    if (urlDataBase[url].userID === id) {
      filteredDataBase[url] = urlDataBase[url];
    }
  }
  return filteredDataBase;
};

////////////////
// Middleware //
////////////////
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieSession({
  name: 'session',
  keys: ['octane', 'mirage', 'bloodhound', 'pathfinder', 'crypto']
}));

// SET View Engine
app.set('view engine', 'ejs');

////////////////
// GET ROUTES //
////////////////

// GET /
app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

// GET /urls.json
app.get('/urls.json', (req, res) => {
  res.json(urlDataBase);
});

// GET /urls
app.get('/urls', (req, res) => {
  if (req.session.userId) {
    const templateVars = {
      urls: urlsForUser(req.session.userId),
      user: userDataBase[req.session.userId]
    };
    res.render('urls-index', templateVars);
  } else {
    res.redirect('/error-log-in-register');
  }

});

// GET /urls/new
app.get('/urls/new', (req, res) => {
  const templateVars = {userDataBase,
    user: userDataBase[req.session.userId]};
  if (req.session.userId) {
    res.render('urls-new',templateVars);
  } else {
    res.redirect('/login');
  }
});

// GET /urls/:shortURL
app.get('/urls/:shortURL', (req, res)=>{
  if (urlDataBase[req.params.shortURL]) {
    if (req.session.userId === urlDataBase[req.params.shortURL].userID) {
      const templateVars = {
        shortURL: req.params.shortURL,
        longURL:urlDataBase[req.params.shortURL].longURL,
        user: userDataBase[req.session.userId]
      };
      res.render('urls-show', templateVars);
    } else {
      res.send('Error you cannot edit this link because you do not own it.');
    }
  } else {
    res.send('Error that URL ID does not exist.');
  }

});

//GET /u/:shortURL
app.get('/u/:shortURL', (req, res) => {
  if (urlDataBase[req.params.shortURL]) {
    res.redirect(`${urlDataBase[req.params.shortURL].longURL}`);
  } else {
    res.redirect('/400');
  }
});

// GET /hello
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

// GET /login
app.get('/login', (req, res) => {
  const templateVars = {
    user: userDataBase[req.session.userId]
  };
  res.render('login', templateVars);
});


// GET /register
app.get('/register', (req,res)=> {
  if (req.session.userId) {
    res.redirect('/urls');
  } else {
    const templateVars = {user: userDataBase[req.session.userId]};
    res.render('register', templateVars);
  }
});

//////////////////////
// ERROR GET ROUTES //
//////////////////////

// GET /400
app.get('/400', (req,res)=>{
  const templateVars = {user: userDataBase[req.session.userId]};
  res.statusCode = 400;
  res.render('400', templateVars);
});

// GET /403
app.get('/403', (req, res)=>{
  const templateVars = {user: userDataBase[req.session.userId]};
  res.statusCode = 403;
  res.render('403', templateVars);
});

// GET /error-log-in-register
app.get('/error-log-in-register', (req, res) => {
  const templateVars = {user: userDataBase[req.session.userId]};
  res.render('error-log-in-register', templateVars);
});

/////////////////
// POST ROUTES //
/////////////////

// POST /urls
app.post('/urls', (req, res) => {
  if (req.session.userId) {
    const shortURL = generateRandomString();
    urlDataBase[shortURL] = {longURL:req.body.longURL, userID:req.session.userId};
    console.log(urlDataBase); //Server-side log of accumulated database.
    res.redirect(`/urls/${shortURL}`);
  }
});

// POST /urls/delete/:shortURL
app.post('/urls/delete/:shortURL', (req,res) => {
  delete urlDataBase[req.params.shortURL];
  console.log(urlDataBase);
  res.redirect('/urls');

});

// POST /urls/edit/:shortURL
app.post('/urls/edit/:shortURL', (req,res) => {
  urlDataBase[req.params.shortURL] = {longURL:req.body.newURL, userID:req.session.userId};
  console.log(urlDataBase); //Server-side log of accumulated database.
  res.redirect(`/urls/${req.params.shortURL}`);
});

// POST /login
app.post('/login', (req,res) =>{
  if (getUserFromDataBase(req.body.email, userDataBase) && req.body.password) {
    if (bcrypt.compareSync(req.body.password, getUserFromDataBase(req.body.email, userDataBase).password)) {
      req.session.userId =  getUserFromDataBase(req.body.email,userDataBase).id;
      res.redirect('/urls');
    } else {
      res.redirect('/403');
    }
  } else {
    res.redirect('/400');
  }
  
  
});

// POST /logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// POST /register
app.post('/register',(req, res) => {
  if (!req.body.email || !req.body.password) {
    res.redirect('/400');
  }
  if (getUserFromDataBase(req.body.email, urlDataBase)) {
    console.log(userDataBase);
    res.redirect('/400');
  } else {
    const email = req.body.email;
    const salt = bcrypt.genSaltSync(10);
    const password = bcrypt.hashSync(req.body.password, salt);
    const userID = generateRandomString();
    req.session.userId =  userID;
  
    
    userDataBase[userID] = {id: userID, email,password};
    console.log('New User Registered');
    console.log('User DataBase Entries', userDataBase);
    res.redirect('/urls');

  }

});

////////////
// Server //
////////////
app.listen(PORT, () => {
  console.log(`The server is now running. Server is listening on Port${PORT}`);
});
