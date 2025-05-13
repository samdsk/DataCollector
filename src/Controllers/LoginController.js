require("dotenv").config();
const RequestError = require("../Errors/RequestError");
const {authenticateUser} = require("../Services/UserService");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const Logger = require("../DataCollector/Loggers/ServerLogger");

const SECRET_KEY = process.env.SERVER_SECRET_KEY;
const SESSION_DURATION = process.env.SERVER_SESSION_DURATION || "3h";

const login = async (req, res, next) => {
    const email = req.body.email || "";
    const password = req.body.password || "";

    if (!email || !password)
        return next(new RequestError("email and password fields are required"));

    if (!validator.isEmail(email))
        return next(new RequestError("invalid email"))

    try {
        const auth = await authenticateUser(email, password);

        if (auth) {
            const token = generateToken(auth.email, auth.userType);
            Logger.info(`Login : ${email}`);
            return res.json({
                success: true,
                token: token,
            })
        } else {
            Logger.info(`Unauthorized login attempted : ${email}`);
            return res.status(401).json({success: false, error: "Unauthorized"});
        }

    } catch (error) {
        next(error);
    }
}

const generateToken = (email, userType) => {
    return jwt.sign({email: email, userType: userType}, SECRET_KEY, {expiresIn: SESSION_DURATION})
}

module.exports = {login}