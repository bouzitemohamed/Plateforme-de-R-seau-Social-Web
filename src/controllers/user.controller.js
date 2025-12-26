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

module.exports = {
  createUser
};
