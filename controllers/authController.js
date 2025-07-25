const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const generateToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });
};

exports.signup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existing = await User.findOne({ email });
        if (existing)
            return res
                .status(400)
                .json({ message: "Email already registered" });

        const hashed = await bcrypt.hash(password, 12);
        const newUser = await User.create({ name, email, password: hashed });

      const token = generateToken(newUser);
      console.log(req.user)
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            domain: process.env.BASE_URL,
            path: "/",
            maxAge: 1000 * 60 * 24 * 60,
        }).json({
          "message" : "Signup successful",
        })
    } catch (err) {
        res.status(403).json({ message: "Signup failed" });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !user.password)
            return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Invalid credentials" });

        const token = generateToken(user);
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            domain: process.env.BASE_URL,
            path: "/",
            maxAge: 1000 * 60 * 24 * 60,
        });
    } catch (err) {
        res.status(500).json({ message: "Login failed" });
    }
};

exports.logout = (req, res) => {
    res.clearCookie("token").json({ message: "Logged out" });
};

exports.getUser = async (req, res) => {
    console.log("Fetching user with ID:", req.userId);
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User  not found" });
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
