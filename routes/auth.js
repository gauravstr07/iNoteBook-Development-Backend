const router = require("express").Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchUser = require("../middleware/fetchUser");

// Route: 1 >>> Create a new User http://localhost:5000/api/auth/createuser >> No login Required
const JWT_SECRET = "Gauravstr2680";
router.post(
  "/createuser",
  [
    body("name", "Enter a valid name").isLength({ min: 5 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Enter a valid password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    // If there errors, return bad request and the error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Check whether the user with this email already exits
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ error: "Sorry a user with this email already exits" });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      res.status(201).json({ authToken });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal server error");
    }
  }
);

// Route: 2 >>> Login User http://localhost:5000/api/auth/login
router.post(
  "/login",
  [body("email", "Enter a valid email").isEmail()],
  [body("password", "Password cannot be black").exists()],
  async (req, res) => {
    // If there errors, return bad request and the error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ error: "Please.. try to login with correct credentials" });
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res
          .status(400)
          .json({ error: "Please.. try to login with correct credentials" });
      }
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      res.json({ authToken });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal server error");
    }
  }
);

// Route: 3 >>> Get loggedin User Detail - http://localhost:5000/api/auth/getuser >> login Required
router.post("/getuser", fetchUser, async (req, res) => {
  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.status(200).send(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
