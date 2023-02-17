import Post from '../models/Post'
import Comment from '../models/Comment'
import PostLike from '../models/PostLike'
import UserFavorite from '../models/UserFavorite'
import CommentLike from '../models/CommentLike'
import Follow from '../models/Follow'
import User, { UserType } from '../models/User'
import { PublicUser } from '../graphql/types'
import { FileUpload } from 'graphql-upload-ts'
import { Error, Document } from 'mongoose'
import { getValidationError, getCustomValidationError } from '../utils'
import fileRepository from './fileRepository'


interface CreatePostInput {
    title?: string | null
    photo: Promise<FileUpload>
    video?: Promise<FileUpload> | null
    userId: string
}

interface Post extends Document {
    userId: UserType
}

async function createPost ({ title = null, photo, video = null, userId }: CreatePostInput) {
    try {
        if (!await User.findById(userId)) {
            return Promise.reject(getCustomValidationError('userId', `User with id ${userId} does not exist`))
        }

        const { url: photoURL } = await fileRepository.storeUpload(photo, '/storage/posts')
        let videoURL = null
        if (video) {
            const { url } = await fileRepository.storeUpload(photo, '/storage/posts')
            videoURL = url
        }

        const post = new Post({
            title,
            photoURL,
            videoURL,
            userId
        })
        await post.save()

        const populatedPost = await Post.populate(post, 'userId') as unknown as Post
        return {
            ...populatedPost.toObject(),
            user: populatedPost.userId,
        }
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        } else {
            throw err
        }
    }
}

interface CreateCommentInput {
    text: string
    postId: string
    userId: string
}

async function createComment ({ text, postId, userId }: CreateCommentInput) {
    try {
        if (!await Post.findById(postId)) {
            return Promise.reject(getCustomValidationError('postId', `Post with id ${postId} does not exist`))
        }

        if (!await User.findById(userId)) {
            return Promise.reject(getCustomValidationError('userId', `User with id ${userId} does not exist`))
        }

        const comment = new Comment({
            text,
            postId,
            userId,
        })
        return await comment.save()
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        } else {
            throw err
        }
    }
}

interface LikePostInput {
    postId: string
    userId: string
}

async function likePost ({ postId, userId }: LikePostInput) {
    try {
        if (!await Post.findById(postId)) {
            return Promise.reject(getCustomValidationError('postId', `Post with id ${postId} does not exist`))
        }

        if (!await User.findById(userId)) {
            return Promise.reject(getCustomValidationError('userId', `User with id ${userId} does not exist`))
        }

        if ((await PostLike.find({ postId, userId })).length > 0) {
            return Promise.reject(getCustomValidationError('postId', `Post with id ${postId} is already liked`))
        }

        const postLike = new PostLike({
            postId,
            userId,
        })
        return await postLike.save()
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        } else {
            throw err
        }
    }
}

interface UnlikePostOptions {
    postId: string
    userId: string
}

async function unlikePost ({ postId, userId }: UnlikePostOptions) {
    try {
        if (!await Post.findById(postId)) {
            return Promise.reject(getCustomValidationError('postId', `Post with id ${postId} does not exist`))
        }

        if (!await User.findById(userId)) {
            return Promise.reject(getCustomValidationError('userId', `User with id ${userId} does not exist`))
        }

        const postLike = await PostLike.findOneAndDelete({ postId, userId })

        if (!postLike) {
            return Promise.reject(getCustomValidationError('postId', `Post with id ${postId} is not liked`))
        }

        return postLike
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        } else {
            throw err
        }
    }
}

interface LikeCommentInput {
    commentId: string
    userId: string
}

async function likeComment ({ commentId, userId }: LikeCommentInput) {
    try {
        if (!await Comment.findById(commentId)) {
            return Promise.reject(getCustomValidationError('commentId', `Comment with id ${commentId} does not exist`))
        }

        if (!await User.findById(userId)) {
            return Promise.reject(getCustomValidationError('userId', `User with id ${userId} does not exist`))
        }

        if ((await CommentLike.find({ commentId, userId })).length > 0) {
            return Promise.reject(getCustomValidationError('commentId', `Comment with id ${commentId} is already liked`))
        }

        const commentLike = new CommentLike({
            commentId,
            userId,
        })
        return await commentLike.save()
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        } else {
            throw err
        }
    }
}

async function getCommentsForPost ({ postId, offset, limit }: { postId: string, offset: number, limit: number }) {
    const aggregateData = await Comment.aggregate([
        {
            $match: { postId },
        },
        {
            $addFields: { commentId: { $toString: '$_id' }}
        },
        {
            $lookup: {
                from: CommentLike.collection.name,
                localField: 'commentId',
                foreignField: 'commentId',
                as: 'likes',
            }
        },
        {
            $project: {
                _id: 1,
                text: 1,
                postId: 1,
                userId: 1,
                createdAt: 1,
                likesCount: { $size: '$likes' },
            }
        },
        {
            $sort: {
                createdAt: 1
            }
        },
        {
            $facet: {
                metadata: [{
                    $count: 'count'
                }],
                data: [{
                    $skip: offset,
                }, {
                    $limit: limit,
                }]
            }
        }
    ])

    const commentsWithLikes = await Comment.populate(aggregateData[0].data, 'userId') as unknown as Array<{
        _id: string
        text: string
        postId: string
        userId: UserType
        createdAt: string
        likesCount: number
    }>

    return {
        total: aggregateData[0].metadata[0].count,
        data: commentsWithLikes.map(comment => ({
            _id: comment._id,
            text: comment.text,
            postId: comment.postId,
            user: comment.userId,
            createdAt: comment.createdAt,
            likesCount: comment.likesCount,
        })),
    }
}

async function getFollowedUsersPostsPaginated ({ userId, offset, limit }: { userId: string, offset: number, limit: number }) {
    try {
        if (!await User.findById(userId)) {
            return Promise.reject(getCustomValidationError('userId', `User with id ${userId} does not exist`))
        }

        const userFollows = await Follow.find({ followingUserId: userId }).select('followedUserId')
        const followedUsersIds = userFollows.map(follow => follow.followedUserId)

        const aggregateData = await Post.aggregate([
            {
                $match: { userId: { $in: followedUsersIds }},
            },
            {
                $addFields: { postId: { $toString: '$_id' }}
            },
            {
                $lookup: {
                    from: Comment.collection.name,
                    localField: 'postId',
                    foreignField: 'postId',
                    as: 'comments'
                }
            },
            {
                $project: {
                    postId: 1,
                    title: 1,
                    photoURL: 1,
                    videoURL: 1,
                    userId: 1,
                    createdAt: 1,
                    commentsCount: { $size: '$comments' }
                }
            },
            {
                $lookup: {
                    from: PostLike.collection.name,
                    localField: 'postId',
                    foreignField: 'postId',
                    as: 'postLikes'
                }
            },
            {
                $addFields: {
                    liked: {
                        $in: [userId, '$postLikes.userId']
                    }
                }
            },
            {
                $lookup: {
                    from: UserFavorite.collection.name,
                    localField: 'postId',
                    foreignField: 'postId',
                    as: 'userFavorites'
                }
            },
            {
                $addFields: {
                    favorite: {
                        $in: [userId, '$userFavorites.userId']
                    }
                }
            },
            {
                $unwind: {
                    path: '$postLikes',
                    preserveNullAndEmptyArrays: true,
                }
            },
            {
                $sort: { 'postLikes.createdAt': -1 }
            },
            {
                $group: {
                    _id: '$postId',
                    postId: { $first: '$postId' },
                    title: { $first: '$title' },
                    photoURL: { $first: '$photoURL' },
                    videoURL: { $first: '$videoURL' },
                    userId: { $first: '$userId' },
                    createdAt: { $first: '$createdAt' },
                    commentsCount: { $first: '$commentsCount' },
                    liked: { $first: '$liked' },
                    favorite: { $first: '$favorite' },
                    likesCount: {
                        $sum: {
                            $cond: [{ $ifNull: ['$postLikes', false] }, 1, 0]
                        }
                    },
                    firstLikeUserId: { $first: '$postLikes.userId' }
                }
            },
            {
                $sort: { 'createdAt': -1 }
            },
            {
                $facet: {
                    metadata: [{
                        $count: 'count'
                    }],
                    data: [
                        {
                            $skip: offset,
                        },
                        {
                            $limit: limit,
                        },
                        {
                            $addFields: {
                                userObjectId: { $toObjectId: '$userId' },
                                firstLikeUserObjectId: { $toObjectId: '$firstLikeUserId' },
                            }
                        },
                        {
                            $lookup: {
                                from: User.collection.name,
                                localField: 'userObjectId',
                                foreignField: '_id',
                                as: 'users'
                            }
                        },
                        {
                            $lookup: {
                                from: User.collection.name,
                                localField: 'firstLikeUserObjectId',
                                foreignField: '_id',
                                as: 'firstLikeUsers'
                            }
                        },
                    ]
                }
            }
        ])

        return {
            total: aggregateData[0].metadata[0].count,
            data: aggregateData[0].data.map(post => ({
                ...post,
                user: post.users[0],
                firstLikeUser: post.firstLikeUsers.length > 0 ? post.firstLikeUsers[0] : null
            }))
        }
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        } else {
            throw err
        }
    }
}

interface GetUsersWhoLikedPostOptions {
    postId: string
    userId: string
    offset: number
    limit: number
}

interface LikingUser extends PublicUser {
    following: boolean
}

async function getUsersWhoLikedPost ({ postId, userId, offset, limit }: GetUsersWhoLikedPostOptions): Promise<{ total: number, data: Array<LikingUser> }> {
    try {
        if (!await Post.findById(postId)) {
            return Promise.reject(getCustomValidationError('postId', `Post with id ${postId} does not exist`))
        }

        if (!await User.findById(userId)) {
            return Promise.reject(getCustomValidationError('userId', `User with id ${userId} does not exist`))
        }

        const paginatedUsersData = await PostLike.aggregate([
            {
                $match: { postId }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $facet: {
                    metadata: [{
                        $count: 'count'
                    }],
                    data: [
                        {
                            $skip: offset,
                        },
                        {
                            $limit: limit,
                        },
                        {
                            $project: {
                                userId: 1
                            }
                        }
                    ]
                }
            }
        ])

        const users = await PostLike.populate(paginatedUsersData[0].data, 'userId') as unknown as Array<{ userId: Document }>

        const userFollows = await Follow.find({ followingUserId: userId }).select('followedUserId')
        const followedUsersIds = userFollows.map(follow => follow.followedUserId)
        const followedUsersIdsMap = followedUsersIds.reduce((usersMap, userId) => ({
            ...usersMap,
            [userId]: true
        }), {})

        return {
            total: paginatedUsersData[0].metadata[0].count,
            data: users.map(user => ({
                ...user.userId.toObject(),
                following: followedUsersIdsMap.hasOwnProperty(user.userId._id.toString())
            }))
        }
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        } else {
            throw err
        }
    }
}

interface MarkUserPostAsFavoriteOptions {
    userId: string
    postId: string
}

async function markUserPostAsFavorite ({ userId, postId }: MarkUserPostAsFavoriteOptions) {
    try {
        if (!await Post.findById(postId)) {
            return Promise.reject(getCustomValidationError('postId', `Post with id ${postId} does not exist`))
        }

        if (!await User.findById(userId)) {
            return Promise.reject(getCustomValidationError('userId', `User with id ${userId} does not exist`))
        }

        if ((await UserFavorite.find({ postId, userId })).length > 0) {
            return Promise.reject(getCustomValidationError('postId', `User ${userId} already marked ${postId} as favorite`))
        }

        const userFavorite = new UserFavorite({
            postId,
            userId,
        })
        return await userFavorite.save()
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        } else {
            throw err
        }
    }
}

interface UnmarkUserPostAsFavoriteOptions {
    userId: string
    postId: string
}

async function unmarkUserPostAsFavorite ({ userId, postId }: UnmarkUserPostAsFavoriteOptions) {
    try {
        if (!await Post.findById(postId)) {
            return Promise.reject(getCustomValidationError('postId', `Post with id ${postId} does not exist`))
        }

        if (!await User.findById(userId)) {
            return Promise.reject(getCustomValidationError('userId', `User with id ${userId} does not exist`))
        }

        const userFavorite = await UserFavorite.findOneAndDelete({ userId, postId })

        if (!userFavorite) {
            return Promise.reject(getCustomValidationError('postId', `UserFavorite with postId ${postId} does not exist`))
        }

        return userFavorite
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        } else {
            throw err
        }
    }
}

export default {
    createPost,
    createComment,
    likePost,
    unlikePost,
    likeComment,
    getCommentsForPost,
    getFollowedUsersPostsPaginated,
    getUsersWhoLikedPost,
    markUserPostAsFavorite,
    unmarkUserPostAsFavorite,
}