const express = require("express"); // <<----- and this
const app = express(); // <<------------------ REMEMBER THIS
const PORT = 8080; // default port 8080
const morgan = require('morgan');
app.use(morgan('combined'));
app.set("view engine", "ejs")

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const cookieParser = require('cookie-parser');
app.use(cookieParser());



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
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
  const userId = req.cookies['user_id']
  const currentUser = users[userId];
  let templateVars = { user: currentUser }
  res.render("urls_new", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], }
  delete urlDatabase[templateVars.shortURL]

  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = req.body.newURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});


app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies['user_id']
  const currentUser = users[userId];
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: currentUser }
  res.render("urls_show", templateVars);
});


app.post("/urls", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console
  let newShortUrl = generateRandomString();
  //res.send(newShortUrl);         // Respond with 'Ok' (we will replace this)
  urlDatabase[newShortUrl] = `http://` + req.body.longURL;
  //console.log(JSON.stringify(urlDatabase));


  // Update your express server so that when it receives a POST request to / urls it responds with a redirection to / urls /: shortURL, where shortURL is the random string we generated.
  res.redirect("/u/" + newShortUrl);
});

app.get("/urls", (req, res) => {
  const userId = req.cookies['user_id']
  const currentUser = users[userId];
  let templateVars = { urls: urlDatabase, user: currentUser };
  res.render("urls_index", templateVars);
  // ADD TO OTHER ROUTES
});


app.get("/u/:shortURL", (req, res) => {
  const userId = req.cookies['user_id']
  const currentUser = users[userId];
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: currentUser };
  //res.render("urls_show", templateVars);
  //console.log("UM TEST");
  res.redirect(templateVars.longURL);
  //Redirect any request to "/u/:shortURL" to its longURL

});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/login", (req, res) => {
  let username = req.body.username;
  //console.log(username);
  res.cookie("username", username);
  res.redirect("/urls")
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  // Implement the /logout endpoint so that it clears the username cookie and redirects the user back to the /urls page.
  res.redirect("/urls")
});

app.get("/register", (req, res) => {
  const userId = req.cookies['user_id'];
  const currentUser = users[userId];
  let templateVars = { user: currentUser };
  res.render("register", templateVars)
});

app.post("/register", (req, res) => {
  let email = req.body.email
  let password = req.body.password
  let newID = generateRandomString()
  addNewUser(email, password, newID)

  console.log(users)
  res.cookie("user_id", newID);
  res.redirect("/urls")
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});