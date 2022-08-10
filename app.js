const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const databasePath = path.join(__dirname, "userData.db");
const app = express();
app.use(express.json());
const bcrypt = require("bcrypt");

let db = null;

const initializeServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error:${error.message}`);
    process.exit(1);
  }
};

initializeServer();

let validatePassword = (password) => {
  return password.length > 4;
};

app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const selectQuery = `SELECT * FROM user WHERE username='${username}'`;
  const dbUser = await db.get(selectQuery);

  if (dbUser === undefined) {
    const createQuery = `INSERT INTO user(username,name,password,gender,location)
        VALUES('${username}','${name}','${password}','${gender}','${location}')`;

    if (validatePassword(password)) {
      await db.run(createQuery);
      response.send("User created successfully");
    } else {
      response.status(400);
      response.send("Password is too short");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const selectQuery = `SELECT * FROM user WHERE username='${username}'`;
  const databaseQuery = await db.get(selectQuery);
  if (databaseQuery === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const isPasswordMatched = await bcrypt.compare(
      password,
      databaseUser.password
    );
    if (isPasswordMatched === undefined) {
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});

app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;

  const selectUserQuery = `SELECT * FROM user WHERE username='${username}'`;
  const databaseUser = await db.get(selectUserQuery);
  if (databaseUser === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const isPasswordMatched = await db.bcrypt.compare(
      oldPassword,
      databaseUser.password
    );

    if (isPasswordMatched === true) {
      if (validatePassword(newPassword)) {
        const hashPassword = await bcrypt.hash(newPassword, 10);
        const updatedPasswordQuery = `UPDATE  user SET password='${hashedPassword}'
                WHERE username='${username}'`;
        const user = await db.run(updatedPasswordQuery);
        response.send("Password updated");
      } else {
        response.status(400);
        response.send("Password is too short");
      }
    } else {
      response.status(400);
      response.send("Invalid current password");
    }
  }
});
module.exports = app;
