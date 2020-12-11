const { userExists, getUserID, urlsForUser, generateRandomString } = require('./helpers');
const express = require('express');
const app = express();
const port = 8080;
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));

//Set view engine to EJS
app.set('view engine', 'ejs');

// Database of valid URLS with unique Ids
const URLDatabase = {

  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "12345": { longURL: "http://www.google.com", userID: 'kb8w25' },
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
  if (userID) {
    res.redirect('/urls');
  }
  res.render('pages/login', templateVars);
});

// Routing for LOGIN requests
app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let userID = getUserID(email, users);
  if (userExists(email, users) && bcrypt.compareSync(password, users[userID].password)) {
    req.session.userID = userID;
    res.redirect('/urls');
  } else if (!userExists(email, users)) {
    res.send('Invalid email. Status code 403');
  } else if (!bcrypt.compareSync(password, users[userID].password)) {
    res.send('Invalid Password. StatusCode 403');
  }
});

//Routing for homepage (GET /)
app.get('/', (req, res) => {
  if (req.session.userID) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
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
  if (req.session.userID) {
    res.redirect('/urls');
  }
  res.render('pages/registration', templateVars);
});

//Routing to register a new user
app.post('/register', (req, res) => {
  let userID = generateRandomString();
  let email = req.body.email;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  if ((email !== "") && (!userExists(email, users) && req.body.password !== "")) {
    users[userID] = {id: userID, email, password: hashedPassword};
    req.session.userID = userID;
  } else if (userExists(email, users)) {
    res.send('<h1>400 error. That email address is already registered.</h1>');
  } else if (req.body.password === "") {
    res.send('<h1>400 error. Please enter a valid password.</h1>');
  } else if (email === "") {
    res.send('<h1>400 error. Please enter a valid email.</h1>')
  }
  res.redirect('/urls');
});

//Post request routing for new urls
app.post('/urls', (req, res) => {
  let shortURL = generateRandomString();
  URLDatabase[shortURL] = { longURL: req.body['longURL'], userID: req.session.userID};
  res.redirect(`/urls/${shortURL}`);
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

//Routing for /urls/new page
app.get('/urls/new', (req, res) => {
  let userID = req.session.userID;
  let user = users[userID];
  if (user) {
    const templateVars =  { user };
    res.render('pages/urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

//Routing for URLS/show page
app.get('/urls/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  if (!URLDatabase[shortURL]) {
    res.send('<h1>Error. No URLS registered for that ID</h1>');
  }
  let longURL = URLDatabase[shortURL].longURL;
  let userID = req.session.userID;
  let user = users[userID];
  let userOwns; // userOwns variable prevents users from editing another user's URLS
  if (user) {
    if (user.id === URLDatabase[shortURL].userID) {
      userOwns = true;
    } else {
      userOwns = false;
    }
  }
  const templateVars =  { shortURL, longURL, user, userOwns };
  res.render('pages/urls_show', templateVars);
  
});


// /urls displays URLDatabase object
app.get('/urls', (req, res) => {
  if (req.session.userID) {
    let userID = req.session.userID;
    let user = users[userID];
    const urlsForPage = urlsForUser(userID, URLDatabase);
    const templateVars = { urls: urlsForPage, user, };
    res.render('pages/urls_index', templateVars);
  // If not logged in, page indicates that users must be logged in to access URLS
  } else {
    let user = null;
    let url = null;
    const templateVars = { user, urls: url };
    res.render('pages/urls_index', templateVars);
  }
});

//Routing for urls: shortURL page
app.get('/u/:shortURL', (req, res) => {
  if (!URLDatabase[req.params.shortURL]) {
    res.send('<h1>Error. No URLS registered for that ID</h1>');
  }
  const longURL = URLDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Hello page contains html data
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

// Check if server is running
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});