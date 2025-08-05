const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const generateToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });
};

const signup = async (req, res) => {
    const { name, email, password } = req.headers;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Please fill all the fields" });
    }
    try {
        const existing = await User.findOne({ email });
        if (existing)
            return res
                .status(400)
                .json({ message: "User already registered" });

        const hashed = await bcrypt.hash(password, 12);
        const newUser = await User.create({ name, email, password: hashed });

        console.table(newUser.toObject())
        res.status(201).json({
            message: "Signup successful",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Signup failed" });
    }
};

const login = async (req, res) => {
    const { email, password } = req.headers;
    if (!email || !password) {
        return res.status(400).json({ message: "Please fill all the fields" });
    }
    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ message: "User not found, please signup before logging in" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Invalid credentials" });

        const token = generateToken(user);
        console.log(token);
        console.table(user.toObject())
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 1000 * 60 * 24 * 60,
        }).status(200).json({
            message: "Login successful",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Login failed" });
    }
};

const logout = (req, res) => {
    try {
        console.log("Logging out");
        res.clearCookie("token").json({ message: "Logged out" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Logout failed" });
    }
    
};

const getUser = async (req, res) => {
    const userId = req.userId;
    console.log("Fetching user with ID:", userId);
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { signup, login, logout, getUser };