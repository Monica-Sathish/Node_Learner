require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("./model/persons");
const auth = require("./middleware/auth");

const app = express();

app.use(express.json({ limit: "50mb" }));

app.post("/register", async (req, res) => {
  try {
    // Get persons input
    const { first_name, last_name, email, password } = req.body;

    // Validate persons input
    if (!(email && password && first_name && last_name)) {
      res.status(400).send("All input is required");
    }

    // check if persons already exist
    // Validate if persons exist in our database
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    //Encrypt persons password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create persons in our database
    const persons = await User.create({
      first_name,
      last_name,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
    });

    // Create token
    const token = jwt.sign(
      { persons_id: persons._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    // save persons token
    persons.token = token;

    // return new persons
    res.status(201).json(persons);
  } catch (err) {
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
  try {
    // Get persons input
    const { email, password } = req.body;

    // Validate persons input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    // Validate if persons exist in our database
    const persons = await User.findOne({ email });

    if (persons && (await bcrypt.compare(password, persons.password))) {
      // Create token
      const token = jwt.sign(
        { persons_id: persons._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      // save persons token
      persons.token = token;

      // persons
      res.status(200).json(persons);
    }
    res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
});

app.get("/welcome", auth, (req, res) => {
  res.status(200).send("Welcome 🙌 ");
});

// This should be the last route else any after it won't work
app.use("*", (req, res) => {
  res.status(404).json({
    success: "false",
    message: "Page not found",
    error: {
      statusCode: 404,
      message: "You reached a route that is not defined on this server",
    },
  });
});

module.exports = app;
