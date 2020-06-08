const express = require("express"); // <<----- and this
const app = express(); // <<------------------ REMEMBER THIS
const PORT = 8080; // default port 8080

app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//ENDPOINT
app.get("/", (req, res) => {
  res.send("Hello!");
});

//ENDPOINT
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//ENDPOINT
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});