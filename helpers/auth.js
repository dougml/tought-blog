module.exports.checkAuth = async (req, res, next) => {
    const userid = req.session.userid;

    if (!userid) {
        return res.redirect("/login");
    }

    next();
};
