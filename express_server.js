//module.require = { userExists, passwordIsValid, getUserID, urlsForUser };
const { userExists } = require('./helpers');
const { getUserID } = require('./helpers');
const { urlsForUser } = require('./helpers');
const { generateRandomString } = require('./helpers');
const express = require('express');
const app = express();
const port = 8080;
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));

//Set view engine to EJS
app.set('view engine', 'ejs');

// Database of valid URLS with unique Ids
const URLDatabase = {

  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: 'kb8w25' }
};

// User Database (shamelessly stolen from Compass)
const users = {
  'wym92o':
   { id: 'wym92o',
     email: 'user@example.com',
     password: '$2b$10$F76oVw2iH0Ds31OfdICK/O3awH4S138IrgQMt.hJK3xTzvB.giSX6'
   },
  q6nlil:
     { id: 'q6nlil',
       email: 'user2@example.com',
       password:
        '$2b$10$CXU9T0uqRIDqJKi7.2dci.qsYmKqLaGorJc.RV.p7Ot1BGGRJ/HDa' },
  // Sample User, password hashed by bcrypt. Real password is "password"
  'kb8w25':
  { id: 'kb8w25',
    email: 'c@g',
    password:
     '$2b$10$gwMWu.mDlnIBqVaaYQyRvuCqUNU6c6Ww9TmJNjZUV.dXkL8T0PsyW' }
};

// Routing for LOGIN Page
app.get('/login', (req, res) => {
  let userID = req.session.userID;
  let user = users[userID];
  let templateVars = { user };
  res.render('pages/login', templateVars);
});

// Routing for LOGIN requests
app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let userID = getUserID(email, users);
  console.log(email, users);
  if (userExists(email, users) && bcrypt.compareSync(password, users[userID].password)) {
    req.session.userID = userID;
    res.redirect('/urls');
  } else if (!userExists(email, users)) {
    res.send('Invalid email. Status code 403');
  } else if (!bcrypt.compareSync(password, users[userID].password)) {
    res.send('Invalid Password. StatusCode 403');
  }

});

//Routing for LOGOUT
app.post('/logout', (req, res) => {
  res.clearCookie('userID');
  req.session = null;
  res.redirect('/urls');
});

//Routing for registration page
app.get('/register', (req, res) => {
  let userID = req.session.userID;
  let user = users[userID];
  const templateVars = { user };
  res.render('pages/registration', templateVars);
});

//Routing to register a new user
app.post('/register', (req, res) => {
  let userID = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!userExists(email, URLDatabase) && password !== "") {
    users[userID] = {id: userID, email, password: hashedPassword};
    req.session.userID = userID;
  } else {
    res.send('<h1>400 error. Invalid email and/ or password</h1>');
  }
  res.redirect('/urls');
});

//Post request routing for new urls
app.post('/urls', (req, res) => {
  let shortURL = generateRandomString();
  URLDatabase[shortURL] = { longURL: req.body['longURL'], userID: req.session.userID};
  res.redirect(`/u/${shortURL}`);
});

// Routing for delete requests
app.post('/urls/:shortURL/delete', (req, res) => {
  let shortURL = req.params.shortURL;
  if (req.session.userID) {
    delete URLDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
  
});

//Routing to handle updates to URLS
app.post('/urls/:shortURL/edit', (req, res) => {
  let shortURL = req.params.shortURL;
  if (req.session.userID) {
    URLDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.userID };
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

//Routing for URLS/show page
app.get('/urls/show/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  let userID = req.session.userID;
  let user = users[userID];
  const templateVars =  { shortURL, longURL: URLDatabase[shortURL], user };
  res.render('pages/urls_show', templateVars);
});

//Routing for /urls/new page
app.get('/urls/new', (req, res) => {
  let userID = req.session.userID;
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
  let userID = req.session.userID;
  let user = users[userID];
  const urlsForPage = urlsForUser(userID, URLDatabase);
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