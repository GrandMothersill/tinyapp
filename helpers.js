const bcrypt = require('bcrypt');

// returns user, or false if there is no match
const getUserByEmail = function(email, database) {
  for (const user in database) {
    if (email === database[user].email) {
      return database[user];
    }
  }
  return false;
};

const getUserURLs = function(id, database) {
  let idURLs = {};
  for (const key in database) {
    if (database[key].userID === id) {
      idURLs[key] = database[key];
    }
  }
  return idURLs;
};

const addNewUser = function(email, password, userId, database) {
  const newUser = {
    id: userId,
    email,
    password
  };
  database[userId] = newUser;

  return userId;
};

const generateRandomString = function() {
  let characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let string = '';
  for (let i = 0; i < 6; i++) {
    let ranNumb = Math.floor(Math.random() * characters.length);
    string += characters[ranNumb];
  }
  return string;
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "ad8r4l" },
};

const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "ad8r4l": {
    id: "ad8r4l",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

module.exports = { getUserByEmail, getUserURLs, addNewUser, generateRandomString, urlDatabase, users };
