const express = require("express");
const knex = require("knex");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dbConfig = require("./knexfile");

const server = express();
const db = knex(dbConfig.development);
server.use(express.json());

const secret = "thisSecret";

function generateToken(user) {
  const payload = {
    username: user.username
  };
  const option = {
    expiresIn: "12h",
    jwtid: "12345"
  };
  return jwt.sign(payload, secret, options);
}

server.get("/", (req, res) => {
  res.send("Route Working");
});

server.post("/api/register", (req, res) => {
  const creds = req.body;
  const hash = bcrypt.hashSync(creds.password, 10);
  creds.password = hash;

  db("users")
    .insert(creds)
    .then(id => {
      const token = generateToken(creds.username);
      res.status(201).json({ id, token });
    })
    .catch(err => res.status(500).senda(err));
});

server.post("/api/login", (req, res) => {
  const creds = req.body;
  db("users")
    .where({ username: creds.username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(creds.password, user.password)) {
        const token = generateToken(creds.username);
        res.status(200).json({ message: "Log in successful", token });
      } else {
        res.status(401).json({ message: "You shall not pass!" });
      }
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

server.get("/api/users", (req, res) => {
  db("users")
    .then(users => {
      res.status(200).json(users);
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`\n Server running on port: ${PORT}`));