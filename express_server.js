const express = require('express');
const app = express();
const port = 8080;
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

//Set view enging to EJS
app.set('view engine', 'ejs');


// Database of valid URLS with unique Ids
const URLDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Routing for /urls/new page
app.get('/urls/new', (req, res) => {
  res.render('pages/urls_new');
});
// /urls displays URLDatabase object 
app.get('/urls', (req, res) => {
  const templateVars = { urls: URLDatabase}
  res.render('pages/urls_index', templateVars);
});

//Routing for urls: shortURL page
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = { shortURL: req.params.shortURL, longURL: URLDatabase[shortURL] };
  res.render('pages/urls_show', templateVars);
})
// Hello page contains html data
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});
// Check if server is running
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
})