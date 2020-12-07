const express = require('express');
const app = express();
const port = 8080;

//Set view enging to EJS
app.set('view engine', 'ejs');


// Database of valid URLS with unique Ids
const URLDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
// Homepage displays "Hello!";
app.get('/', (request, response) => {
  response.render('pages/index');
});

app.get('/about', (req, res) => {
  res.render('pages/about');
})
// urls displays URLDatabase object 
app.get('/urls', (req, res) => {
  const templateVars = { urls: URLDatabase}
  res.render('pages/urls_index', templateVars);
});

//Routing for urls: shortURL page
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = { shortURL: req.params.shortURL, longURL: URLDatabase[shortURL] };
  //res.send(templateVars);
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