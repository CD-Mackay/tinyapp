const express = require('express');
const app = express();
const port = 8080;
const bodyParser = require('body-parser');
const cookieParser=require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//Set view engine to EJS
app.set('view engine', 'ejs');

//Generate unique ID for new URLS
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

// Database of valid URLS with unique Ids
const URLDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Routing for LOGOUT requests
app.post('/login', (req, res) => {
  console.log(req.body);
  let userName = req.body.username;
  res.cookie('username', userName, {httpOnly: true});
  res.redirect('/urls');
})

//Routing for LOGOUT
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
})

//Post request routing for new urls
app.post('/urls', (req, res) => {
  let id = generateRandomString();
  URLDatabase[id] = req.body['longURL'];
  res.redirect(`/u/${id}`);
});

// Routing for delete requests
app.post('/urls/:shortURL/delete', (req, res) => {
  let shortURL = req.params.shortURL
  delete URLDatabase[shortURL]
  res.redirect('/urls');
});

//Routing to handle updates to URLS
app.post('/urls/:shortURL/edit', (req, res) => {
  let shortURL = req.params.shortURL;
  URLDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls')
});

//Routing for URLS/show page
app.get('/urls/show/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL
  const username = req.cookies['username'];
  const templateVars =  { shortURL, longURL: URLDatabase[shortURL], username };
  res.render('pages/urls_show', templateVars);
});

//Routing for /urls/new page
app.get('/urls/new', (req, res) => {
  res.render('pages/urls_new');
});

// /urls displays URLDatabase object
app.get('/urls', (req, res) => {
  const username = req.cookies['username'];
  const templateVars = { urls: URLDatabase, username, };
  res.render('pages/urls_index', templateVars);
});

//Routing for urls: shortURL page
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = URLDatabase[shortURL];
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