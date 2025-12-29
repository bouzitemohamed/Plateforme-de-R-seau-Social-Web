const User = require('../models/user.model');
const responseHandler = require('../utils/responseHandler');
const { statusCodes } = require('../utils/statusCodes');
const hashPassword = require('../utils/hashPassword'); 
const createUser = async (req, res) => {
  try {
    const { username, email, password, isPrivate } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }]
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'Email' : 'Username';
      return responseHandler.error(
        res,
        `${field} already exists`,
        statusCodes.CONFLICT
      );
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    const userData = {
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      isPrivate: isPrivate || false
    };

    if (req.file) {
      userData.avatar = req.file.buffer;
      userData.avatarType = req.file.mimetype;
    }

    const user = new User(userData);
    await user.save();

    // Prepare response
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      isPrivate: user.isPrivate,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      avatar: user.avatar ? `data:${user.avatarType};base64,${user.avatar.toString('base64')}` : null
    };

    return responseHandler.success(
      res,
      userResponse,
      'User created successfully',
      statusCodes.CREATED
    );

  } catch (error) {
    return responseHandler.error(
      res,
      'Failed to create user',
      statusCodes.INTERNAL_SERVER_ERROR,
      process.env.NODE_ENV === 'development' ? error.message : undefined
    );
  }
};
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return responseHandler.notFound(res, 'User');
    }

    const {
      username,
      email,
      password,
      isPrivate
    } = req.body;

    // Check username uniqueness
    if (username && username !== user.username) {
      const exists = await User.findOne({ username });
      if (exists) {
        return responseHandler.error(
          res,
          'Username already exists',
          statusCodes.CONFLICT
        );
      }
      user.username = username;
    }

    // Check email uniqueness
    if (email && email.toLowerCase() !== user.email) {
      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) {
        return responseHandler.error(
          res,
          'Email already exists',
          statusCodes.CONFLICT
        );
      }
      user.email = email.toLowerCase();
    }

    // Update password
    if (password) {
      user.password = await hashPassword(password);
    }

    // Update privacy
    if (typeof isPrivate === 'boolean') {
      user.isPrivate = isPrivate;
    }

    // Update avatar
    if (req.file) {
      user.avatar = req.file.buffer;
      user.avatarType = req.file.mimetype;
    }

    await user.save();

    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      isPrivate: user.isPrivate,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      avatar: user.avatar
        ? `data:${user.avatarType};base64,${user.avatar.toString('base64')}`
        : null
    };

    return responseHandler.success(
      res,
      userResponse,
      'Profile updated successfully',
      statusCodes.UPDATED
    );

  } catch (error) {
    console.error('Update profile error:', error);
    return responseHandler.error(
      res,
      'Failed to update profile',
      statusCodes.INTERNAL_SERVER_ERROR,
      process.env.NODE_ENV === 'development' ? error.message : undefined
    );
  }
};

module.exports = {
  createUser,
  updateProfile
};
