import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

// generic helper: field is "video" | "comment" | "tweet"
const toggleLike = async (field, id, userId) => {
    if (!isValidObjectId(id)) {
        throw new ApiError(400, `Invalid ${field} id`)
    }

    const filter = { [field]: id, likedBy: userId }
    const existing = await Like.findOne(filter)

    if (existing) {
        await Like.findByIdAndDelete(existing._id)
        return { liked: false }
    }

    await Like.create(filter)
    return { liked: true }
}

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const result = await toggleLike("video", videoId, req.user._id)

    return res.status(200).json(
        new ApiResponse(200, result, result.liked ? "Video liked" : "Video unliked")
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const result = await toggleLike("comment", commentId, req.user._id)

    return res.status(200).json(
        new ApiResponse(200, result, result.liked ? "Comment liked" : "Comment unliked")
    )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const result = await toggleLike("tweet", tweetId, req.user._id)

    return res.status(200).json(
        new ApiResponse(200, result, result.liked ? "Tweet liked" : "Tweet unliked")
    )
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id),
                video: { $exists: true, $ne: null }
            }
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
                            pipeline: [{ $project: { username: 1, fullName: 1, avatar: 1 } }]
                        }
                    },
                    { $addFields: { owner: { $first: "$owner" } } }
                ]
            }
        },
        { $unwind: "$video" },
        { $sort: { createdAt: -1 } },
        { $replaceRoot: { newRoot: "$video" } }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}