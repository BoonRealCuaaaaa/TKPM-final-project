const models = require("../models");

const authUser = async (req, res, next) => {
    if (req.isAuthenticated()) {
        res.locals.user = req.user;
        res.locals.accountType = req.user.type;
        next();
    } else {
        const nextUrl = req.originalUrl;
        return res.redirect(`/login?nextUrl=${nextUrl}`);
    }
}

const authRole = (type) => {
    return async (req, res, next) => {
        const account = req.user;
        if (account.type !== type) {
            res.status(401)
            return res.render("404.ejs");
        }
        res.locals.accountType = type;
        res.locals.createWardDistrictPageQueryString = require("../util/queryString").createWardDistrictPageQueryString;
        next();
    }
}

const storeRedirectToInSession = (req, res, next) => {
    req.session.nextUrl = req.body.nextUrl || req.query.nextUrl || "";
    next();
} 

module.exports = {
    authUser,
    authRole,
    storeRedirectToInSession
}


