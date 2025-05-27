import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user?._id;

  if (!name || !description) {
    throw new ApiError(400, "Name and description are required");
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: userId,
    videos: [],
  });

  if (!playlist) {
    throw new ApiError(500, "Failed to create playlist");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const playlists = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
      },
    },
    {
      $addFields: {
        totalVideos: { $size: "$videos" },
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        totalVideos: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "Playlists fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }

  const playlist = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
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
              owner: { $first: "$owner" },
            },
          },
        ],
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
        owner: { $first: "$owner" },
        totalVideos: { $size: "$videos" },
      },
    },
  ]);

  if (!playlist || playlist.length === 0) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist[0], "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  const userId = req.user?._id;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist or video id");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const playlist = await Playlist.findOne({
    _id: playlistId,
    owner: userId,
  });

  if (!playlist) {
    throw new ApiError(404, "Playlist not found or you don't have permission");
  }

  if (playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video already in playlist");
  }

  playlist.videos.push(videoId);
  await playlist.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video added to playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  const userId = req.user?._id;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist or video id");
  }

  const playlist = await Playlist.findOne({
    _id: playlistId,
    owner: userId,
  });

  if (!playlist) {
    throw new ApiError(404, "Playlist not found or you don't have permission");
  }

  if (!playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video not in playlist");
  }

  playlist.videos = playlist.videos.filter(
    (id) => id.toString() !== videoId.toString()
  );
  await playlist.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video removed from playlist successfully")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  const userId = req.user?._id;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }

  const playlist = await Playlist.findOneAndDelete({
    _id: playlistId,
    owner: userId,
  });

  if (!playlist) {
    throw new ApiError(404, "Playlist not found or you don't have permission");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  const userId = req.user?._id;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }

  if (!name && !description) {
    throw new ApiError(400, "Name or description is required");
  }

  const playlist = await Playlist.findOneAndUpdate(
    {
      _id: playlistId,
      owner: userId,
    },
    {
      $set: {
        name: name || undefined,
        description: description || undefined,
      },
    },
    {
      new: true,
    }
  );

  if (!playlist) {
    throw new ApiError(404, "Playlist not found or you don't have permission");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
