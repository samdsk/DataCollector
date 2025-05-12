const bcrypt = require('bcrypt');
const {User} = require('../Models/User');

const opts = {runValidators: true};

const createSimpleUser = async (email, password) => {
    return await createUser(email, password);
}

const createUser = async (email, password, userType = "LLM") => {
    const found = await User.exists({email: email});

    if (found) return null;

    const hash = await bcrypt.hash(password, 10);
    const result = await User.create({email: email, password: hash, userType: userType});

    return result;
}

const changePassword = async (email, currentPassword, newPassword) => {
    const found = await User.findOne({email: email});
    if (!found) return null;

    const checkPassword = await bcrypt.compare(currentPassword, found.password);
    if (!checkPassword) return null;

    const newHash = await bcrypt.hash(newPassword, 10);

    return User.updateOne({email: email}, {password: newHash});
}

const deleteUser = async (email, password) => {
    const found = await User.findOne({email: email});
    if (!found) return null;

    const checkPassword = await bcrypt.compare(password, found.password);
    if (!checkPassword) return null;

    return User.deleteOne({email: email});
}

const changeUserType = async (email, userType) => {
    const found = await User.findOne({email: email});
    if (!found) return null;

    return User.updateOne({email: email}, {userType: userType}, opts);
}

const authenticateUser = async (email, password) => {
    const found = await User.findOne({email: email});
    if (!found) return false;

    const passwordCheck = bcrypt.compare(password, found.password);

    if (passwordCheck) return {email: email, userType: found.userType};

    return false;
}

const getUserType = async (email) => {
    const found = await User.findOne({email: email}, "userType").lean();
    if (!found) return null;

    return found.userType;
}

module.exports = {
    createSimpleUser,
    createUser,
    changePassword,
    deleteUser,
    changeUserType,
    authenticateUser,
    getUserType
}