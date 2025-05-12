const RequestError = require("../Errors/RequestError");
const UserService = require("../Services/UserService");
const validator = require("validator");
const USER_TYPES = require("../Models/User").USER_TYPES;
const Logger = require("../Library/Loggers/ServerLogger");

const createUser = async (req, res, next) => {

    const email = req.body.email || "";
    const password = req.body.password || "";

    if (!email || !password) {
        return next(new RequestError("email and password fields are required!"));
    }

    if (!validator.isEmail(email))
        return next(new RequestError("invalid email"));

    if (password.length < 6)
        return next(new RequestError("password must be at least 6 characters!"));

    try {
        Logger.info(`User create: ${email}`);
        const result = await UserService.createSimpleUser(email, password);
        if (!result) return next(new RequestError("User already exists!"));
        return res.json({success: true});
    } catch (error) {
        next(error)
    }
}

const deleteUser = async (req, res, next) => {
    const email = req.body.email || "";
    const password = req.body.password || "";

    if (!email || !password) {
        return next(new RequestError("email and password fields are required!"));
    }

    if (!validator.isEmail(email))
        return next(new RequestError("invalid email"));

    try {
        Logger.info(`User delete: ${email}`);
        const result = await UserService.deleteUser(email, password);
        if (!result) return next(new RequestError("Delete operation failed"));
        return res.json({success: true});
    } catch (error) {
        next(error)
    }
}

const changePassword = async (req, res, next) => {
    const email = req.body.email || "";
    const currentPassword = req.body.currentPassword || "";
    const newPassword = req.body.newPassword || "";

    if (!email || !currentPassword || !newPassword) {
        return next(new RequestError("email, currentPassword and newPassword fields are required!"));
    }

    if (!validator.isEmail(email))
        return next(new RequestError("invalid email"));

    if (newPassword.length < 6)
        return next(new RequestError("password must be at least 6 characters!"));

    try {
        Logger.info(`User change password: ${email}`);
        const result = await UserService.changePassword(email, currentPassword, newPassword);
        if (!result) return next(new RequestError("Something went wrong during password change"));

        return res.json({success: true});
    } catch (error) {
        next(error)
    }
}

const changeUserType = async (req, res, next) => {
    const email = req.body.email || "";
    const userType = req.body.userType || "";


    if (!email || !userType) {
        return next(new RequestError("email and userType fields are required!"));
    }

    if (!validator.isEmail(email))
        return next(new RequestError("invalid email"));

    if (!USER_TYPES.includes(userType))
        return next(new RequestError("invalid userType, possible userType: LLM, AnnotationService"));

    try {
        Logger.info(`User change user type: ${email}`);
        const result = await UserService.changeUserType(email, userType);

        if (!result) return next(new RequestError("Something went wrong during userType change"));

        return res.json({success: true});
    } catch (error) {
        next(error)
    }
}


module.exports = {
    createUser,
    changePassword,
    changeUserType,
    deleteUser
}