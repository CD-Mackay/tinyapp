const express = require('express');
const app = express();
const port = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//Set view engine to EJS
app.set('view engine', 'ejs');

//Generate unique ID for new URLS
const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

// Database of valid URLS with unique Ids
const URLDatabase = {

  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: '8l53yy' }
};

// User Database (shamelessly stolen from Compass)
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
  '8l53yy': {
    id: '8l53yy',
    email: 'me@googlewontwork.com',
    password: "password"
  }
};

//Helper function to determine if an email address is already being used
const userExists = function(email) {
  for (const user in users) {
    if (users[user].email === email) {
      return true;
    }
  } return false;
};

// Function for checking passwords
const passwordIsValid = function(userID, password) {
  if (users[userID].password === password) {
    return true;
  } return false;
};

// Retrieve the users ID using email
const getUserID = function(email) {
  for (const user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
};

// Retrieve list of URLS associated with userID
const urlsForUser = function(id) {
  let results = {}
  for (const url in URLDatabase) {
    if (URLDatabase[url].userID === id) {
      results[url] = URLDatabase[url].longURL;
    }
  } return results;
};

// Routing for LOGIN Page
app.get('/login', (req, res) => {
  let userID = req.cookies.userID;
  let user = users[userID];
  let templateVars = { user }
  res.render('pages/login', templateVars);
})

// Routing for LOGIN requests
app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let userID = getUserID(email);
  if (userExists(email) && passwordIsValid(userID, password)) {
    res.cookie('userID', userID, {httponly: true});
  } else if (!userExists(email)) {
    res.send('Invalid email. Status code 403')
  } else if (!passwordIsValid(userID, password)) {
    res.send('Invalid Password. StatusCode 403')
  }
  res.redirect('/urls');
});

//Routing for LOGOUT
app.post('/logout', (req, res) => {
  res.clearCookie('userID');
  res.redirect('/urls');
});

//Routing for registration page
app.get('/register', (req, res) => {
  let userID = req.cookies.userID;
  let user = users[userID];
  const templateVars = { user };
  res.render('pages/registration', templateVars)
});

//Routing to register a new user
app.post('/register', (req, res) => {
  let userID = generateRandomString();
  let email = req.body.email;
  let password = req.body.password
  if (!userExists(email) && password !== "") {
  users[userID] = {id: userID, email, password};
  res.cookie('userID', userID, {httponly: true});
  } else {
    res.send('400 error');
  }
  res.redirect('/urls');
})

//Post request routing for new urls
app.post('/urls', (req, res) => {
  let shortURL = generateRandomString();
  URLDatabase[shortURL] = { longURL: req.body['longURL'], userID: req.cookies.userID};
  res.redirect(`/u/${shortURL}`);
});

// Routing for delete requests
app.post('/urls/:shortURL/delete', (req, res) => {
  let shortURL = req.params.shortURL;
  if (req.cookies.userID) {
  delete URLDatabase[shortURL];
  res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
  
});

//Routing to handle updates to URLS
app.post('/urls/:shortURL/edit', (req, res) => {
  let shortURL = req.params.shortURL;
  if (req.cookies.userID) {
  URLDatabase[shortURL] = { longURL: req.body.longURL, userID: req.cookies.userID };
  res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

//Routing for URLS/show page
app.get('/urls/show/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  let userID = req.cookies.userID;
  let user = users[userID];
  const templateVars =  { shortURL, longURL: URLDatabase[shortURL], user }; 
  res.render('pages/urls_show', templateVars);
});

//Routing for /urls/new page
app.get('/urls/new', (req, res) => {
  let userID = req.cookies.userID;
  let user = users[userID];
  if (userID) {
    const templateVars =  { user };
    res.render('pages/urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

// /urls displays URLDatabase object
app.get('/urls', (req, res) => {
  let userID = req.cookies.userID;
  let user = users[userID];
  const urlsForPage = urlsForUser(userID);
  const templateVars = { urls: urlsForPage, user, };
  res.render('pages/urls_index', templateVars);
});

//Routing for urls: shortURL page
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = URLDatabase[shortURL].longURL;
  res.redirect(301, longURL);
});

// Hello page contains html data
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

// Check if server is running
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});