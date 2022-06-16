const bodyParser = require('body-parser');
const express = require('express');
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 1337; //Default Port is leet.





//////////
// Data //
//////////

// Url Database
const urlDataBase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.ca'
};

// User Database
const userDataBase = {
  'db0913': {id:'db0913', email: 'a@a.com', password: 'qwerty'},
  'bl0819': {id:'bl0819', email: 'b@b.com', password: 'qwerty'}

}




//////////////////////
// Helper Functions //
/////////////////////

// Generate string for shortened links
const generateRandomString = () => {
  return Math.random().toString(36).slice(2,8) //Simplified generator found on https://stackoverflow.com/questions/10726909/random-alpha-numeric-string-in-javascript. 
}

//Check if email is already registered in the database.
const checkIfRegistered = (email) => {
  for(user in userDataBase){
    if(userDataBase[user].email === email){
      return true;
    }
  }
  return false;
}

// const getUserIDFromDataBase = (email) => {
//   for(user in userDataBase){
//     if(userDataBase[user].email === email){
//       return userDataBase[user].id
//     }
//   }
// }
const getUserFromDataBase = (email) => {
  for(user in userDataBase){
    if(userDataBase[user].email === email){
      return userDataBase[user]
    }
  }
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
    user: userDataBase[req.cookies.userID]
  };
  res.render('urls-index', templateVars);
});

// GET /urls/new
app.get('/urls/new', (req, res) => {
  const templateVars = {userDataBase,
    user: userDataBase[req.cookies.userID]}
  res.render('urls-new',templateVars);
})

// GET /urls/:shortURL
app.get('/urls/:shortURL', (req, res)=>{
  
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL:urlDataBase[req.params.shortURL],
    user: userDataBase[req.cookies.userID]
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

// GET /login
app.get('/login', (req, res) => {
  const templateVars = {
    user: userDataBase[req.cookies.userID]
  }
  res.render('login', templateVars)
})


// GET /register
app.get('/register', (req,res)=> {
  const templateVars = {user: userDataBase[req.cookies.userID]}
  res.render('register', templateVars)
})

// GET /400
app.get('/400', (req,res)=>{
  const templateVars = {user: userDataBase[req.cookies.userID]}
  res.statusCode = 400
  res.render('400', templateVars)
})

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
  // const userName = req.body.userName;
  // res.cookie('username', userName)
  console.log(req.body)
  if(checkIfRegistered(req.body.email)){
    res.cookie('userID', getUserFromDataBase(req.body.email).id)
    res.redirect('/urls')
  }
  else{
    res.redirect('/400')
  }
})

// POST /logout
app.post('/logout', (req, res) => {
  res.clearCookie('userID')
  res.redirect('/login')
})

// POST /register
app.post('/register',(req, res) => {
  if(!req.body.email || !req.body.password){
    res.redirect('/400')
  }
  if(checkIfRegistered(req.body.email)){
    console.log(userDataBase)
    res.redirect('/400')
  }

  else{
    const email = req.body.email;
    const password = req.body.password;
    const userID = generateRandomString();
    res.cookie('userID', userID)
  
    
    userDataBase[userID] = {id: userID, email,password}
    console.log('New User Registered');
    console.log('User DataBase Entries', userDataBase)
    res.redirect('/urls');

  }

})

////////////
// Server //
////////////
app.listen(PORT, () => {
  console.log(`The server is now running. Server is listening on Port${PORT}`);
});

