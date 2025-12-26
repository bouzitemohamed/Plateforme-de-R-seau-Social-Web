require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require('../models/user.model');
const responseHandler = require('../utils/responseHandler');
const { statusCodes } = require('../utils/statusCodes');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const generateTokens = require('../utils/generateToken');
const envVar = require('../config/EnvVariable');

const register = async (req, res) => {
  try {
    const { username, email, password, isPrivate } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }]
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'Email' : 'Username';
      return responseHandler.error(res, `${field} already exists`, statusCodes.CONFLICT);
    }

    const hashed = await hashPassword(password);

    const userData = {
      username,
      email: email.toLowerCase(),
      password: hashed,
      isPrivate: isPrivate || false
    };
    if (req.files?.avatar) {
      userData.avatar = req.files.avatar[0].buffer;
      userData.avatarType = req.files.avatar[0].mimetype;
    }
    if (req.files?.banner) {
      userData.banner = req.files.banner[0].buffer;
      userData.bannerType = req.files.banner[0].mimetype;
    }

    const user = new User(userData);
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      isPrivate: user.isPrivate,
      avatar: user.avatar ? `data:${user.avatarType};base64,${user.avatar.toString('base64')}` : null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return responseHandler.success(res, { user: userResponse, accessToken }, 'User registered successfully', statusCodes.CREATED);

  } catch (error) {
    return responseHandler.error(res, 'Failed to register user', statusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return responseHandler.unauthorized(res, 'Invalid credentials');

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return responseHandler.unauthorized(res, 'Invalid credentials');

    const { accessToken, refreshToken } = generateTokens(user);

    user.refreshToken = refreshToken;
    await user.save();

    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      isPrivate: user.isPrivate,
      avatar: user.avatar ? `data:${user.avatarType};base64,${user.avatar.toString('base64')}` : null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return responseHandler.success(res, { user: userResponse, accessToken }, 'Login successful', statusCodes.SUCCESS);

  } catch (error) {
    return responseHandler.error(res, 'Failed to login', statusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return responseHandler.unauthorized(res, 'No refresh token provided');

    const payload = jwt.verify(token, envVar.REFRESH_TOKEN_SECRET);
    const user = await User.findById(payload.id);
    if (!user || user.refreshToken !== token) return responseHandler.unauthorized(res, 'Invalid refresh token');

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return responseHandler.success(res, { accessToken }, 'Token refreshed successfully');

  } catch (error) {
    return responseHandler.unauthorized(res, 'Failed to refresh token');
  }
};

const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const payload = jwt.verify(token, envVar.REFRESH_TOKEN_SECRET);
      const user = await User.findById(payload.id);
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }

    res.clearCookie("refreshToken");
    return responseHandler.success(res, null, 'Logged out successfully');
  } catch (error) {
    return responseHandler.error(res, 'Failed to logout', statusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout
};
