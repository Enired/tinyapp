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

const urlDataBase = {
  'b2xVn2': {
    longURL:'http://www.lighthouselabs.ca',
    userID:'db0913'},
  '9sm5xK': {
    longURL:'http://www.google.ca',
    userID:'bl0819'}
};

const userDataBase = {
  'db0913': {id:'db0913', email: 'a@a.com', password: '$2a$10$oqO8MbfYT1CnADwmn5qaqe3jiuQPBanGHG0NYsQXxQnZDGp3ubxqy'},
  'bl0819': {id:'bl0819', email: 'b@b.com', password: '$2a$10$oqO8MbfYT1CnADwmn5qaqe3jiuQPBanGHG0NYsQXxQnZDGp3ubxqy'}
};

//////////////////////
// Helper Functions //
/////////////////////

// Generate string for shortened links
const generateRandomString = () => {
  return Math.random().toString(36).slice(2,8);
};

// Filters database and creates another sub-database containing links made by a specific user.
const urlsForUser = (id) =>{
  const filteredDataBase = {};
  for (const shortURL in urlDataBase) {
    const linkObj = urlDataBase[shortURL];
    if (linkObj.userID === id) {
      filteredDataBase[shortURL] = linkObj;
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
    return res.redirect('/urls');
  }
  return res.redirect('/login');
  
});

// GET /urls
app.get('/urls', (req, res) => {
  if (req.session.userId) {
    const userOwnLinks = urlsForUser(req.session.userId);
    const user = userDataBase[req.session.userId];
    const templateVars = {
      urls: userOwnLinks,
      user
    };
    return res.render('urls-index', templateVars);
  } else {
    return res.redirect('/error-log-in-register');
  }
});

// GET /urls/new
app.get('/urls/new', (req, res) => {
  const cookie = req.session.userId;
  const user = userDataBase[cookie];
  const templateVars = {userDataBase, user};
  if (cookie) {
    return res.render('urls-new',templateVars);
  } else {
    return res.redirect('/login');
  }
});

// GET /urls/:shortURL
app.get('/urls/:shortURL', (req, res)=>{
  const shortURL = req.params.shortURL;
  const shortURLDetails = urlDataBase[shortURL];
  if (shortURLDetails) {
    if (req.session.userId === shortURLDetails.userID) {
      const templateVars = {
        shortURL,
        longURL:shortURLDetails.longURL,
        user: userDataBase[req.session.userId]
      };
      return res.render('urls-show', templateVars);
    } else {
      return res.send('Error you cannot edit this link because you do not own it.');
    }
  } else {
    return res.send('Error that URL ID does not exist.');
  }


});

//GET /u/:shortURL
app.get('/u/:shortURL', (req, res) => {
  const shortURLDetails = urlDataBase[req.params.shortURL];
  if (shortURLDetails) {
    return res.redirect(`${shortURLDetails.longURL}`);
  } else {
    return res.redirect('/400');
  }
});

// GET /login
app.get('/login', (req, res) => {
  const user = userDataBase[req.session.userId];
  const templateVars = {user};
  res.render('login', templateVars);
});


// GET /register
app.get('/register', (req,res)=> {
  const cookie = req.session.userId;
  if (cookie) {
    return res.redirect('/urls');
  } else {
    const templateVars = {user: userDataBase[cookie]};
    return res.render('register', templateVars);
  }
});

//////////////////////
// ERROR GET ROUTES //
//////////////////////

// GET /400
app.get('/400', (_,res)=>{
  const templateVars = {user: null};
  res.statusCode = 400;
  res.render('400', templateVars);
});

// GET /403
app.get('/403', (_, res)=>{
  const templateVars = {user: null};
  res.statusCode = 403;
  res.render('403', templateVars);
});

// GET /error-log-in-register
app.get('/error-log-in-register', (_, res) => {
  const templateVars = {user: null};
  res.render('error-log-in-register', templateVars);
});

/////////////////
// POST ROUTES //
/////////////////

// POST /urls
app.post('/urls', (req, res) => {
  if (req.session.userId) {
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;
    const userID = req.session.userId;
    urlDataBase[shortURL] = {longURL, userID};
    res.redirect(`/urls/${shortURL}`);
  }
});

// POST /urls/delete/:shortURL
app.post('/urls/delete/:shortURL', (req,res) => {
  const shortURL = req.params.shortURL;
  delete urlDataBase[shortURL];
  console.log(urlDataBase);
  res.redirect('/urls');
});

// POST /urls/edit/:shortURL
app.post('/urls/edit/:shortURL', (req, res) => {
  const newLongURL = req.body.newURL;
  const userID = req.session.userId;
  const shortURL = req.params.shortURL;
  urlDataBase[shortURL] = {longURL:newLongURL, userID};
  res.redirect(`/urls/${shortURL}`);
});

// POST /login
app.post('/login', (req, res) =>{
  const emailInput = req.body.email;
  const passwordInput = req.body.password;
  const user = getUserFromDataBase(emailInput, userDataBase);

  if (user && passwordInput) {
    if (bcrypt.compareSync(passwordInput, user.password)) {
      req.session.userId = user.id;
      return res.redirect('/urls');
    } else {
      return res.redirect('/403');
    }
  } else {
    return res.redirect('/400');
  }
});

// POST /logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// POST /register
app.post('/register',(req, res) => {
  const email = req.body.email;
  const passwordInput = req.body.password;

  if (!email || !passwordInput) {
    res.redirect('/400');
  }
  const userFound = getUserFromDataBase(email, urlDataBase);
  // If user exists.
  if (userFound.id) {
    return res.redirect('/400');
  }
  const salt = bcrypt.genSaltSync(10);
  const password = bcrypt.hashSync(passwordInput, salt);
  const userID = generateRandomString();
  req.session.userId =  userID;
  
    
  userDataBase[userID] = {id: userID, email, password};
  return res.redirect('/urls');
});

////////////
// Server //
////////////
app.listen(PORT, () => {
  console.log(`The server is now running. Server is listening on Port${PORT}`);
});
