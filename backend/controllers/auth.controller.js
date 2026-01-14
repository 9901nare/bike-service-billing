const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = (req, res) => {
  const { name, email, password } = req.body;
  const hashed = bcrypt.hashSync(password, 10);

  db.query(
    "INSERT INTO users (name,email,password) VALUES (?,?,?)",
    [name, email, hashed],
    err => {
      if (err) return res.status(400).json(err);
      res.json({ message: "Signup successful" });
    }
  );
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email=?",
    [email],
    (err, result) => {
      if (result.length === 0)
        return res.status(401).json({ message: "User not found" });

      const user = result[0];
      const valid = bcrypt.compareSync(password, user.password);
      if (!valid)
        return res.status(401).json({ message: "Invalid password" });

      const token = jwt.sign({ id: user.id }, "SECRET_KEY", {
        expiresIn: "1d"
      });

      res.json({ token });
    }
  );
};
