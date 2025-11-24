module.exports = function (req, res, next) {
    const token = req.headers['authorization'];

    if (!token || token !== process.env.API_KEY) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    next();
};
