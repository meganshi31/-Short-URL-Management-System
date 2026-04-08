const bcrypt = require("bcryptjs");
const router = require("express").Router();

const authMiddleware = require("../middlewares/authMiddleware");
const {
  createUser,
  findUserByEmail,
} = require("../storage/repository");
const generateToken = require("../utils/generateToken");

function formatUser(user) {
  return {
    id: user.id,
    email: user.email,
  };
}

router.post("/register", async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long." });
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser({
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Registration successful.",
      token: generateToken(user.id),
      user: formatUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "User already exists." });
    }

    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    return res.json({
      message: "Login successful.",
      token: generateToken(user.id),
      user: formatUser(user),
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
    },
  });
});

router.post("/logout", (_req, res) => {
  res.json({
    message: "Logout successful on client side. Discard the token.",
  });
});

module.exports = router;
