const userMiddleware = (req, res, next) => {

    if (req.user.role !== "user") {
        return res.status(403).json({
            message: "Access denied. Voting is for users only."
        });
    }

    next();
};

module.exports = userMiddleware;