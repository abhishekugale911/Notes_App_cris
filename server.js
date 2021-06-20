const mysql = require("mysql");
const connection = require("./connection.js");
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");

let randomInt = 1; // Used to generate username randomly

const app = express();
app.use(express.json());
app.use(cookieParser());

const oneDay = 1000 * 60 * 60 * 24;

app.use(
  session({
    secret: "secret key for notes app",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: oneDay },
  })
);

app.get("/begin", async (req, res) => {
  let username = "User" + randomInt;
  const secret = req.session.id;
  const user = {
    username,
    secret,
  };

  const sqlQuery = `SELECT secret FROM user WHERE secret='${secret}';`;
  connection.query(sqlQuery, (err, result) => {
    if (err) {
      console.log(err);
      res.status(404);
      res.send("ERRORRRRRR! WITH DB");
    } else {
      if (result[0]) {
        res.status(200);
        // res.send("YOU ARE ALREADY LOGGED IN!");
        res.redirect("/list");
        
      } else {
        const sqlQuery = `INSERT INTO user (username,secret) VALUES ('${username}', '${secret}')`;

        connection.query(sqlQuery, (err, result) => {
          if (err) {
            console.log(err);
            res.status(400);
            res.send(`Could not insert in table: ${err}`);
          } else {
            req.session.user = user;
            req.session.save();
            
            res.status(201);
            res.json({ username, secret });
            randomInt++;
          }
        });
      }
    }
  });
});

app.post("/login", (req, res) => {
  // console.log(req.body);
  const { secret, username } = req.body;
  const user = {
    username,
    secret,
  };

  const sqlQuery = `SELECT username FROM user WHERE username = '${username}' AND secret = '${secret}';`;
  connection.query(sqlQuery, (err, result) => {
    if (err) {
      res.status(401);
      res.send("ERROR IN DB!");
    } else {
      if (result[0]) {
        res.status(200);
        req.session.user = user;
        req.session.save();
        res.redirect("/list");
      } else {
        res.status(401);
        res.send("COULD NOT LOGIN! NO ACCOUNT FOUND!");
      }
    }
  });
});

app.get("/list", (req, res) => {
  if (!req.session.user) {
    res.status(401);
    return res.send("PLEASE LOGIN TO ACESS NOTES!");
  }
  const { username } = req.session.user;

  const sqlQuery = `SELECT * FROM notes WHERE username='${username}'`;
  console.log(username);
  connection.query(sqlQuery, (err, result) => {
    if (err) {
      res.status(401);
      res.send("ERROR IN SERVER!");
    } else {
      if (result.length > 0) {
        let obj = {};
        result.forEach((not) => {
          obj[`${not.note_id}`] = not.title;
        });
        res.send(obj);
        res.status(200);
      } else {
        res.status(401);
        res.send("NO NOTES OF USER");
      }
    }
  });
});

app.get("/content", (req, res) => {
  if (req.session.user) {
    const { secret, username } = req.session.user;
    const id = req.body.id;
    const sqlQuery = `SELECT * FROM notes WHERE note_id=${id}`;
    connection.query(sqlQuery, (err, result) => {
      if (err) {
        res.status(401);
        return res.send(`ERROR IN SERVER! DB: error isss : ${err}`);
      } else if (result.length > 0 && result[0].username === username) {
        res.status(200).send(result[0].note);
        console.log(result);
      } else if (result.length === 0) {
        res.status(404).send("Note not found!");
        return;
      } else {
        res.status(401).send("You don't have any note of that id!");
        return;
      }
    });
  } else {
    res.status(401).send("User not logged in!");
    return;
  }
});

app.post("/create", (req, res) => {
  const title = req.headers.title;
  const content = req.body.content;
  if (content.length > 1000 || title.length > 20) {
    title.length > 20
      ? res.status(400).send("Note title length too long!")
      : res.status(400).send("Note length too long!");
    return;
  }

  if (req.session.user) {
    const { secret, username } = req.session.user;

    const sqlQuery1 = `SELECT COUNT(username) FROM notes WHERE username='${username}';`;
    connection.query(sqlQuery1, async (err, result) => {
      if (err) {
        res.status(401);
        return res.send(`ERROR IN SERVER! DB: error isss : ${err}`);
      } else if (result[0]["COUNT(username)"] > 10) {
        return res.status(400).send("MAX Notes limit exceded!!");
      }
    });

    const sqlQuery = `INSERT INTO notes(username,title,note) VALUES('${username}','${title}','${content}')`;
    connection.query(sqlQuery, async (err, result) => {
      if (err) {
        res.status(401);
        return res.send(`ERROR IN SERVER! DB: error isss : ${err}`);
      } else {
        res.status(201).send("Note successfully created!");
      }
    });
  } else {
    res.status(401).send("User not logged in!");
    return;
  }
});

app.get("/logout", (req, res) => {
  if (req.session.user) {
    req.session.destroy();
    res.send("User logged out!!");
  } else {
    res.send("No user was logged in😑");
  }
});

app.listen(3000, () => {
  console.log("Server is up and running at port 3000.");
});
