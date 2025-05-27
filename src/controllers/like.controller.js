import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video

  const userId = req.user?._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  // Check if video exists
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Check if like already exists
  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: userId,
  });

  if (existingLike) {
    // Unlike if already liked
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { isLiked: false }, "Video unliked successfully")
      );
  } else {
    // Like if not already liked
    const like = await Like.create({
      video: videoId,
      likedBy: userId,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, { isLiked: true }, "Video liked successfully")
      );
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment

  const userId = req.user?._id;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }

  // Check if comment exists
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // Check if like already exists
  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });

  if (existingLike) {
    // Unlike if already liked
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { isLiked: false }, "Comment unliked successfully")
      );
  } else {
    // Like if not already liked
    const like = await Like.create({
      comment: commentId,
      likedBy: userId,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, { isLiked: true }, "Comment liked successfully")
      );
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet

  const userId = req.user?._id;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }

  // Check if tweet exists
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  // Check if like already exists
  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: userId,
  });

  if (existingLike) {
    // Unlike if already liked
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { isLiked: false }, "Tweet unliked successfully")
      );
  } else {
    // Like if not already liked
    const like = await Like.create({
      tweet: tweetId,
      likedBy: userId,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, { isLiked: true }, "Tweet liked successfully")
      );
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const userId = req.user?._id;

  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(userId),
        video: { $exists: true },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
            },
          },
          {
            $addFields: {
              owner: { $first: "$owner" },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        video: { $first: "$video" },
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
