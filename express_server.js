const express = require("express"); // <<----- and this
const app = express(); // <<------------------ REMEMBER THIS
const PORT = 8080; // default port 8080
const morgan = require('morgan');
app.use(morgan('combined'));
app.set("view engine", "ejs")

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

var cookieSession = require('cookie-session')
app.set('trust proxy', 1) // trust first proxy
app.use(cookieSession({
  name: 'session',
  keys: ["sAEIutSODFkASDDfmQr4e1934190qwmA"]
}))

const bcrypt = require('bcrypt');

const { getUserByEmail } = require('./helpers');

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



const urlsForUser = function(id) {
  let idURLs = {};
  //let userID = req.session.user_id ///////////////////////////////////////////

  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      idURLs[key] = urlDatabase[key];
    }
  };
  return idURLs;
};

function addNewUser(email, password, userId) {
  const newUser = {
    id: userId,
    email,
    password
  }
  users[userId] = newUser;

  return userId;
};

function generateRandomString() {
  let characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let string = '';
  for (let i = 0; i < 6; i++) {
    ranNumb = Math.floor(Math.random() * characters.length)
    string += characters[ranNumb];
  }
  return string;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const currentUser = users[userId];
  let templateVars = { user: currentUser }
  res.render("urls_new", templateVars);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL
  const userId = req.session.user_id
  const currentUser = users[userId];
  if (!currentUser) {
    res.send("You don't even go here...........................")
  } else if (urlDatabase[shortURL].userID !== currentUser.id) {
    res.send("Hey! You can't be here! Go log in, you ruffian!")
  } else {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, }
    delete urlDatabase[templateVars.shortURL]
    res.redirect("/urls");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  const userId = req.session.user_id
  const currentUser = users[userId];
  if (!currentUser) {
    res.send("You don't even go here...........................")
  } else if (urlDatabase[shortURL].userID !== currentUser.id) {
    res.send("Hey! You can't be here! Go log in, you ruffian!")
  } else {
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect("/urls");
  }
});


app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id
  const currentUser = users[userId];
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, creatorID: urlDatabase[req.params.shortURL].userID, user: currentUser }
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const userId = req.session.user_id
  const currentUser = users[userId];
  if (currentUser) {
    let newShortUrl = generateRandomString();
    urlDatabase[newShortUrl] = { longURL: `http://` + req.body.longURL, userID: userId }
    console.log(urlDatabase);
    //console.log(JSON.stringify(urlDatabase));
    res.redirect("/u/" + newShortUrl);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const currentUser = users[userId];

  let usersURLs = urlsForUser(userId);

  let templateVars = { urls: usersURLs, user: currentUser };
  res.render("urls_index", templateVars);
  // ADD TO OTHER ROUTES
});

app.get("/u/:shortURL", (req, res) => {
  // YOU BETTA NOT CHANGE ME

  const userId = req.session.user_id;
  const currentUser = users[userId];
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: currentUser };
  //res.render("urls_show", templateVars);
  //console.log("UM TEST");
  res.redirect(templateVars.longURL);
  //Redirect any request to "/u/:shortURL" to its longURL

});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/login", (req, res) => {
  let email = req.body.email
  let password = req.body.password
  //let id = req.body
  let x = getUserByEmail(email, users);
  let hashedPass = x.password;
  if (!getUserByEmail(email, users)) {
    res.status(403).send('There is no account associated with that email.');
  } else if (/*password !== x.password*/!bcrypt.compareSync(password, hashedPass)) {
    res.status(403).send('Incorrect password, shoddy haxx myfren.');
  } else if (/*password === x.password */bcrypt.compareSync(password, hashedPass)) {
    console.log("GRAHAM IT WORKED " + x.id);
    /////////////////////////////res.cookie("user_id", x.id)
    req.session.user_id = x.id;
    res.redirect("/urls")
  }
});

app.post("/logout", (req, res) => {
  // res.clearCookie("user_id");
  req.session = null
  res.redirect("/urls")
});

app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const currentUser = users[userId];
  let templateVars = { user: currentUser };
  res.render("register", templateVars)
});


app.post("/register", (req, res) => {
  let email = req.body.email
  let password = req.body.password
  let hashedPassword = bcrypt.hashSync(password, 10);
  if (email === '' || password === '') {
    res.status(400).send('Both fields must be filled-in!')
  } else if (getUserByEmail(email, users)) {
    res.status(400).send('That email is already associated with an account. Please try again with a new email address.')
  } else {
    let newID = generateRandomString()
    req.session.user_id = newID;
    console.log(req.session.user_id);
    addNewUser(email, hashedPassword, newID)
    ///////////////////////////////res.cookie("user_id", newID);
    res.redirect("/urls")

  }
});

app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const currentUser = users[userId];
  let templateVars = { user: currentUser };
  res.render("login", templateVars)
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});





// This also means that the /urls page will need to filter the entire list in the urlDatabase by comparing the userID with the logged-in user's ID. This filtering process should happen before the data is sent to the template for rendering.

// Similarly, this also means that the /urls/:id page should display a message or prompt if the user is not logged in, or if the URL with the matching :id does not belong to them.

// Create a function named urlsForUser(id) which returns the URLs where the userID is equal to the id of the currently logged-in user.