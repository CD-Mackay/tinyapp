const { assert } = require('chai');

const { userExists } = require('../helpers.js');
const { getUserID } = require('../helpers.js');
const { urlsForUser } = require('../helpers.js');


// Constants to test functions against
  const testUsers = {
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
    'kb8w25': { 
      id: 'kb8w25',
    email: 'c@g',
    password:
     '$2b$10$gwMWu.mDlnIBqVaaYQyRvuCqUNU6c6Ww9TmJNjZUV.dXkL8T0PsyW' }
  };

  const testDatabase = {

    "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
    "9sm5xK": { longURL: "http://www.google.com", userID: 'kb8w25' }
  };

// Unit testing for userExists function
  describe('userExists', function() {
    it('Should return true if the user exists in the database', function() {
      const expectedOutput = true;
      assert.equal(userExists('c@g', testUsers), expectedOutput);
    });
    it('should return false if the user does not exits', function() {
      const expectedOutput = false;
      assert.equal(userExists('connor@gmail.com', testUsers), expectedOutput);
    });
  });

  //Unit testing for getUserId
  describe('getUserId', function() {
    it('should return the users unique ID when passed a valid email', function() {
      const expectedOutput = 'kb8w25'
      assert.equal(getUserID('c@g', testUsers), expectedOutput);
    });
    it('should return undefined if the email is not in the database', function () {
      const expectedOutput = undefined;
      assert.equal(getUserID('connor@gmail.com', testUsers), expectedOutput);
    });
  });

// Unit testing for urlsforUser function

