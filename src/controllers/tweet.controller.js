import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  const userId = req.user?._id;
  // console.log("userId", userId);

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Content is required for tweet");
  }

  const tweet = await Tweet.create({
    content,
    owner: userId,
  });

  if (!tweet) {
    throw new ApiError(500, "Failed to create tweet");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const tweets = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
    {
      $sort: {
        createdAt: -1, // Newest tweets first
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const { content } = req.body;
  const userId = req.user?._id;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Content is required for tweet");
  }

  const tweet = await Tweet.findOne({
    _id: tweetId,
    owner: userId,
  });

  if (!tweet) {
    throw new ApiError(404, "Tweet not found or you don't have permission");
  }

  tweet.content = content;
  await tweet.save({ validateBeforeSave: true });

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;
  const userId = req.user?._id;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }

  const tweet = await Tweet.findOneAndDelete({
    _id: tweetId,
    owner: userId,
  });

  if (!tweet) {
    throw new ApiError(404, "Tweet not found or you don't have permission");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
