const Thread = require("../models/thread.model");
const User = require('../models/user.model');
const Like=require("../models/like.model");
const responseHandler = require("../utils/responseHandler");
const { statusCodes } = require("../utils/statusCodes");

const createThread = async (req, res) => {
  try {
    const { content, parentThread } = req.body;
    if (!content || content.trim() === "") {
      return responseHandler.error(
        res,
        "Thread content is required",
        statusCodes.BAD_REQUEST
      );
    }
    if (parentThread) {
      const parent = await Thread.findById(parentThread);
      if (!parent) {
        return responseHandler.notFound(res, "Parent thread");
      }
    }

    
    const threadData = {
      content: content.trim(),
      author: req.user.id, 
      parentThread: parentThread || null,
    };

    
   
    if (req.file) {
    if (req.file.mimetype.startsWith("image")) {
    threadData.media = {
      type: "image",
      data: req.file.buffer,
      contentType: req.file.mimetype,
    };
    } else if (req.file.mimetype.startsWith("video")) {
    // handle video externally
   }
  } else {
  threadData.media = null;
  }



    
    const thread = await Thread.create(threadData);

    
    return responseHandler.success(
      res,
      thread,
      "Thread created successfully",
      statusCodes.CREATED
    );
  } catch (error) {
    console.error("Create thread error:", error);

    return responseHandler.error(
      res,
      null,
      statusCodes.INTERNAL_SERVER_ERROR
    );
  }
};
const getUserThreads = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, limit } = req.pagination; // from middleware
    const skip = (page - 1) * limit;

    const totalThreads = await Thread.countDocuments({ author: userId,isArchived: false });
        if (totalThreads === 0) {
      return responseHandler.success(
        res,
        { threads: [], pagination: null },
        "You haven't created any threads yet. Start by creating your first thread!",
        statusCodes.SUCCESS
      );
    }

    const threads = await Thread.find({ author: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username')
      .lean();

    const totalPages = Math.ceil(totalThreads / limit);

    return responseHandler.success(res, {
      threads,
      pagination: {
        totalThreads,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    }, 'User threads fetched successfully', statusCodes.SUCCESS);

  } catch (error) {
    console.error('Get user threads error:', error);
    return responseHandler.error(res, null, statusCodes.INTERNAL_SERVER_ERROR);
  }
};
const getThreadById = async (req, res) => {
  try {
    const userId = req.user.id;          
    const { threadId } = req.params;   
    const thread = await Thread.findOne({ _id: threadId, author: userId,isArchived: false })
      .populate('author', 'username') 
      .populate('parentThread', 'content') 
      .lean();

    if (!thread) {
      return responseHandler.notFound(res, "Thread");
    }

    return responseHandler.success(
      res,
      thread,
      'Thread fetched successfully',
      statusCodes.SUCCESS
    );

  } catch (error) {
    console.error('Get thread by ID error:', error);
    return responseHandler.error(res, null, statusCodes.INTERNAL_SERVER_ERROR);
  }
};
const updateThread = async (req, res) => {
  try {
    const userId = req.user.id;
    const { threadId } = req.params;

    // Find the thread by ID and author
    const thread = await Thread.findOne({ _id: threadId, author: userId,isArchived: false });
    if (!thread) {
      return responseHandler.notFound(res, "Thread");
    }
    if (req.body.content !== undefined) {
      thread.content = req.body.content.trim();
    }
    if (req.file) {
      if (req.file.mimetype.startsWith("image")) {
        thread.media = {
          type: "image",
          data: req.file.buffer,
          contentType: req.file.mimetype
        };
      } else if (req.file.mimetype.startsWith("video")) {
        // You can handle video externally (URL)
        thread.media = {
          type: "video",
          url: req.body.mediaUrl || null, // client must send video URL
        };
      }
    } else if (req.body.media === null) {
      // Allow removing media
      thread.media = null;
    }

    await thread.save();

    // Populate author username for response
    const updatedThread = await Thread.findById(thread._id)
      .populate('author', 'username')
      .lean();

    return responseHandler.success(
      res,
      updatedThread,
      'Thread updated successfully',
      statusCodes.UPDATED
    );

  } catch (error) {
    console.error('Update thread error:', error);
    return responseHandler.error(res, null, statusCodes.INTERNAL_SERVER_ERROR);
  }
};

const archiveThread = async (req, res) => {
  try {
    const userId = req.user.id;
    const { threadId } = req.params;

    const thread = await Thread.findOne({ _id: threadId, author: userId });
    if (!thread) {
      return responseHandler.notFound(res, "Thread");
    }

    thread.isArchived = true;
    await thread.save();

    return responseHandler.success(
      res,
      thread,
      "Thread archived successfully",
      statusCodes.UPDATED
    );

  } catch (error) {
    console.error("Archive thread error:", error);
    return responseHandler.error(res, null, statusCodes.INTERNAL_SERVER_ERROR);
  }
};
const getPublicThreads = async (req, res) => {
  try {
    const { page, limit } = req.pagination;
    const skip = (page - 1) * limit;
    const threads = await Thread.find({ isArchived: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'author',
        match: { isPrivate: false }, // only public users
        select: 'username'
      })
      .lean();
    const publicThreads = threads.filter(t => t.author !== null);
    const threadsWithLikes = await Promise.all(
      publicThreads.map(async (thread) => {
        const likeCount = await Like.countDocuments({ thread: thread._id });
        return { ...thread, likeCount };
      })
    );

    const totalThreads = await Thread.countDocuments({ isArchived: false });

    const totalPages = Math.ceil(totalThreads / limit);

    return responseHandler.success(
      res,
      {
        threads: threadsWithLikes,
        pagination: {
          totalThreads,
          totalPages,
          currentPage: page,
          pageSize: limit
        }
      },
      "Public threads fetched successfully",
      statusCodes.SUCCESS
    );

  } catch (error) {
    console.error("Get public threads error:", error);
    return responseHandler.error(res, null, statusCodes.INTERNAL_SERVER_ERROR);
  }
};


module.exports = {
  createThread,
  getUserThreads,
  getThreadById,
  updateThread,
  archiveThread,
  getPublicThreads
};
