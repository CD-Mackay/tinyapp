//Helper function to determine if an email address is already being used
const userExists = function(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return true;
    }
  } return false;
};

// Retrieve the User ID using email
const getUserID = function(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user].id;
    }
  }
};

// Retrieve list of URLS associated with userID
const urlsForUser = function(id, database) {
  let results = {}
  for (const url in database) {
    if (database[url].userID === id) {
      results[url] = database[url].longURL;
    }
  } return results;
};

//Generate unique ID for new URLS
const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

module.exports = { userExists, getUserID, urlsForUser, generateRandomString }