const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");

const register = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(
            req.body.password,
            10
        );

        const user = new User({
            ...req.body,
            password: hashedPassword
        });

        await user.save();

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        res.status(201).json({
            message: "Registration successful",
            token: token
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
const login = async (req, res) => {
    try {
        const user = await User.findOne({
            email: req.body.email
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(
    req.body.password,
    user.password
);

if (!isMatch) {
    return res.status(401).json({
        message: "Invalid password"
    });
}

        const token = jwt.sign(
    {
        userId: user._id,
        role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
);

res.status(200).json({
    message: "Login successful",
    token: token
});
    } catch (error) {
        res.status(500).send(error.message);
    }
};

module.exports = {
    register,
    login
};