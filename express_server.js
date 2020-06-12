const { getUserByEmail, getUserURLs, addNewUser, generateRandomString, urlDatabase, users } = require('./helpers');
const express = require("express");
const app = express();
const PORT = 8080;
const morgan = require('morgan');
app.use(morgan('combined'));
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

let cookieSession = require('cookie-session');
app.set('trust proxy', 1); // trust first proxy
app.use(cookieSession({
  name: 'session',
  keys: ["sAEIutSODFkASDDfmQr4e1934190qwmA"]
}));

///////////////////////////////////////////////////////////////////// 

// Redirects to /urls if logged-in, redirects to /login if not
app.get("/", (req, res) => {
  const userId = req.session.cookieUserId;
  const currentUser = users[userId];
  if (currentUser) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// Input URL to generate and log its shortURL
app.get("/urls/new", (req, res) => {
  const userId = req.session.cookieUserId;
  const currentUser = users[userId];
  if (currentUser) {
    let templateVars = { user: currentUser };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// Delete stored longURL/shortURL pair ONLY IF user is its owner
// Accessed via delete buttons in urls_index
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  const userId = req.session.cookieUserId;
  const currentUser = users[userId];
  if (!currentUser) {
    res.send("You don't even go here...........................");
  } else if (urlDatabase[shortURL].userID !== currentUser.id) {
    res.send("Hey! You can't be here! You don't own this shortURL!");
  } else {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, };
    delete urlDatabase[templateVars.shortURL];
    res.redirect("/urls");
  }
});

// Assigns new longURL to stored shortURL ONLY IF logged in
// Accessed via urls_show
app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  const userId = req.session.cookieUserId;
  const currentUser = users[userId];
  if (!currentUser) {
    res.send("You don't even go here...........................");
  } else if (urlDatabase[shortURL].userID !== currentUser.id) {
    res.send("Hey! You can't be here! You don't own this shortURL!");
  } else {
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect("/urls");
  }
});

// Displays shortURL, longURL, potential to change longURL
// Accessed from edit buttons on urls_index
/* I implemented some of the funtionality of this route directly in the urls_show html file using conditionals.
I don't know if that's something that you want to see. I know I could do it here instead, like elsewhere, but I like how the messages look in the browser.*/
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.cookieUserId;
  const currentUser = users[userId];
  if (!urlDatabase[req.params.shortURL]) {
    res.send("Url does not exist.");
  } else {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, creatorID: urlDatabase[req.params.shortURL].userID, user: currentUser };
    res.render("urls_show", templateVars);
  }
});

// Create new shortURL/longURL/userID object in urlDatabase ONLY IF logged-in
// Accessed via urls_new submit button
app.post("/urls", (req, res) => {
  const userId = req.session.cookieUserId;
  const currentUser = users[userId];
  if (currentUser) {
    let newShortUrl = generateRandomString();
    urlDatabase[newShortUrl] = { longURL: `http://` + req.body.longURL, userID: userId };
    res.redirect("/urls/" + newShortUrl);
  } else {
    res.send("You must be logged in to generate a new shortURL.")
  }
});

// Displays all of a user's URLs
/* I implemented some of the funtionality of this route directly in the urls_index html file using conditionals.
I don't know if that's something that you want to see. I know I could do it here instead, like elsewhere, but I like how the messages look in the browser.*/
app.get("/urls", (req, res) => {
  const userId = req.session.cookieUserId;
  const currentUser = users[userId];
  let usersURLs = getUserURLs(userId, urlDatabase);
  let templateVars = { urls: usersURLs, user: currentUser };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Redirect to shortURL's associated longURL
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.send("That is not a valid shortURL. Who told you it was? They lied to you.")
  } else {
    const userId = req.session.cookieUserId;
    const currentUser = users[userId];
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: currentUser };
    res.redirect(templateVars.longURL);
  }
});

// Display Login page with fields
app.get("/login", (req, res) => {
  const userId = req.session.cookieUserId;
  const currentUser = users[userId];
  if (currentUser) {
    res.redirect("/urls")
  } else {
    let templateVars = { user: currentUser };
    res.render("login", templateVars);
  }
});

// Login to account
// Accessed via submit button on login page
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let storedUser = getUserByEmail(email, users);
  let hashedPass = storedUser.password;
  if (!getUserByEmail(email, users)) {
    res.status(403).send('There is no account associated with that email.');
  } else if (!bcrypt.compareSync(password, hashedPass)) {
    res.status(403).send('Incorrect password. Try password123.');
  } else if (bcrypt.compareSync(password, hashedPass)) {
    req.session.cookieUserId = storedUser.id;
    res.redirect("/urls");
  }
});

// Logout of account
// Accessed via logout button in header
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// Displays registration page
app.get("/register", (req, res) => {
  const userId = req.session.cookieUserId;
  const currentUser = users[userId];
  if (currentUser) {
    res.redirect("/urls")
  } else {
    let templateVars = { user: currentUser };
    res.render("register", templateVars);
  }
});

// Registers new account if input email and password both valid
// Accessed via register page
app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let hashedPassword = bcrypt.hashSync(password, 10);
  if (email === '' || password === '') {
    res.status(400).send('Both fields must be filled-in!');
  } else if (getUserByEmail(email, users)) {
    res.status(400).send('That email is already associated with an account. Please try again with a new email address.');
  } else {
    let newId = generateRandomString();
    req.session.cookieUserId = newId;
    addNewUser(email, hashedPassword, newId, users);
    res.redirect("/urls");
  }
});

// Happy Hello
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Prints listening confirmation w/ port number
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});