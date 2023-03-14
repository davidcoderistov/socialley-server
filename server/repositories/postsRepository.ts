import Post, { PostType } from '../models/Post'
import Comment, { CommentType } from '../models/Comment'
import PostLike, { PostLikeType } from '../models/PostLike'
import UserFavorite, { UserFavoriteType } from '../models/UserFavorite'
import CommentLike, { CommentLikeType } from '../models/CommentLike'
import Follow from '../models/Follow'
import User, { UserType } from '../models/User'
import { FileUpload } from 'graphql-upload-ts'
import { Error, Document, Types } from 'mongoose'
import { getValidationError, getCustomValidationError } from '../utils'
import fileRepository from './fileRepository'
import _uniq from 'lodash/uniq'
import moment from 'moment'


interface Post extends Document {
    userId: UserType
}

interface CreatePostOptions {
    title?: string | null
    photo: Promise<FileUpload>
    video?: Promise<FileUpload> | null
    userId: string
}

interface CreatePostReturnValue extends PostType {
    user: UserType
}

async function createPost ({ title = null, photo, video = null, userId }: CreatePostOptions): Promise<CreatePostReturnValue> {
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

interface CreateCommentOptions {
    text: string
    postId: string
    userId: string
}

async function createComment ({ text, postId, userId }: CreateCommentOptions): Promise<CommentType> {
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

interface LikePostOptions {
    postId: string
    userId: string
}

interface PostLike extends PostLikeType {
    user: UserType
    post: PostType
}

async function likePost ({ postId, userId }: LikePostOptions): Promise<PostLike> {
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

        const savedPostLike = await postLike.save()
        const populatedPostLike = await PostLike.populate(savedPostLike, 'userId postId') as unknown as {
            _id: Types.ObjectId
            userId: UserType
            postId: PostType
            createdAt: string
        }

        return {
            ...savedPostLike.toObject(),
            userId: populatedPostLike.userId._id.toString(),
            user: populatedPostLike.userId,
            post: populatedPostLike.postId,
            postId: populatedPostLike.postId._id.toString(),
        }
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

async function unlikePost ({ postId, userId }: UnlikePostOptions): Promise<PostLikeType> {
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

interface LikeCommentOptions {
    commentId: string
    userId: string
}

async function likeComment ({ commentId, userId }: LikeCommentOptions): Promise<CommentLikeType> {
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

interface UnlikeCommentOptions {
    commentId: string
    userId: string
}

async function unlikeComment ({ commentId, userId }: UnlikeCommentOptions): Promise<CommentLikeType> {
    try {
        if (!await Comment.findById(commentId)) {
            return Promise.reject(getCustomValidationError('commentId', `Comment with id ${commentId} does not exist`))
        }

        if (!await User.findById(userId)) {
            return Promise.reject(getCustomValidationError('userId', `User with id ${userId} does not exist`))
        }

        const commentLike = await CommentLike.findOneAndDelete({ commentId, userId })

        if (!commentLike) {
            return Promise.reject(getCustomValidationError('commentId', `Comment with id ${commentId} is not liked`))
        }

        return commentLike
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        } else {
            throw err
        }
    }
}

interface GetCommentsForPostOptions {
    postId: string
    userId: string
    offset: number
    limit: number
}

interface CommentWithLike {
    _id: string
    text: string
    postId: string
    user: UserType
    liked: boolean
    createdAt: string
    likesCount: number
}

interface GetCommentsForPostReturnValue {
    total: number
    data: CommentWithLike[]
}

async function getCommentsForPost ({ postId, userId, offset, limit }: GetCommentsForPostOptions): Promise<GetCommentsForPostReturnValue> {
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
            $addFields: {
                liked: {
                    $in: [userId, '$likes.userId']
                }
            }
        },
        {
            $project: {
                _id: 1,
                text: 1,
                postId: 1,
                userId: 1,
                liked: 1,
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
        liked: boolean
        createdAt: string
        likesCount: number
    }>

    return {
        total: aggregateData[0].metadata.length > 0 ? aggregateData[0].metadata[0].count : 0,
        data: commentsWithLikes.map(comment => ({
            _id: comment._id,
            text: comment.text,
            postId: comment.postId,
            user: comment.userId,
            liked: comment.liked,
            createdAt: comment.createdAt,
            likesCount: comment.likesCount,
        })),
    }
}

interface GetFollowedUsersPostsPaginatedOptions {
    userId: string
    offset: number
    limit: number
}

interface FollowedUserPost extends PostType {
    commentsCount: number
    likesCount: number
    liked: boolean
    favorite: boolean
    user: UserType
    firstLikeUser: UserType | null
}

interface GetFollowedUsersPostsPaginatedReturnValue {
    total: number
    data: FollowedUserPost[]
}

async function getFollowedUsersPosts ({ userId, offset, limit }: GetFollowedUsersPostsPaginatedOptions): Promise<GetFollowedUsersPostsPaginatedReturnValue> {
    try {
        if (!await User.findById(userId)) {
            return Promise.reject(getCustomValidationError('userId', `User with id ${userId} does not exist`))
        }

        const userFollows = await Follow.find({ followingUserId: userId }).select('followedUserId')
        const followedUsersIds = userFollows.map(follow => follow.followedUserId)

        const aggregateData = await Post.aggregate([
            {
                $match: {
                    $or: [
                        { userId: { $in: followedUsersIds } },
                        { userId }
                    ]
                },
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
            total: aggregateData[0].metadata.length > 0 ? aggregateData[0].metadata[0].count : 0,
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

async function getAllFollowedUsersPosts ({ userId }: { userId: string }): Promise<FollowedUserPost[]> {
    try {
        if (!await User.findById(userId)) {
            return Promise.reject(getCustomValidationError('userId', `User with id ${userId} does not exist`))
        }

        const userFollows = await Follow.find({ followingUserId: userId }).select('followedUserId')
        const followedUsersIds = userFollows.map(follow => follow.followedUserId)

        const aggregateData = await Post.aggregate([
            {
                $match: {
                    $or: [
                        { userId: { $in: followedUsersIds } },
                        { userId }
                    ]
                },
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
        ])

        return aggregateData.map(post => ({
            ...post,
            user: post.users[0],
            firstLikeUser: post.firstLikeUsers.length > 0 ? post.firstLikeUsers[0] : null
        }))
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

interface LikingUser extends UserType {
    following: boolean
}

interface GetUsersWhoLikedPostReturnValue {
    total: number
    data: LikingUser[]
}

async function getUsersWhoLikedPost ({ postId, userId, offset, limit }: GetUsersWhoLikedPostOptions): Promise<GetUsersWhoLikedPostReturnValue> {
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
            total: paginatedUsersData[0].metadata.length > 0 ? paginatedUsersData[0].metadata[0].count : 0,
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

interface GetUsersWhoLikedCommentOptions {
    commentId: string
    userId: string
    offset: number
    limit: number
}

interface GetUsersWhoLikedCommentReturnValue {
    total: number
    data: LikingUser[]
}

async function getUsersWhoLikedComment ({ commentId, userId, offset, limit }: GetUsersWhoLikedCommentOptions): Promise<GetUsersWhoLikedCommentReturnValue> {
    try {
        if (!await Comment.findById(commentId)) {
            return Promise.reject(getCustomValidationError('commentId', `Comment with id ${commentId} does not exist`))
        }

        if (!await User.findById(userId)) {
            return Promise.reject(getCustomValidationError('userId', `User with id ${userId} does not exist`))
        }

        const paginatedUsersData = await CommentLike.aggregate([
            {
                $match: { commentId }
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

        const users = await CommentLike.populate(paginatedUsersData[0].data, 'userId') as unknown as Array<{ userId: Document }>

        const userFollows = await Follow.find({ followingUserId: userId }).select('followedUserId')
        const followedUsersIds = userFollows.map(follow => follow.followedUserId)
        const followedUsersIdsMap = followedUsersIds.reduce((usersMap, userId) => ({
            ...usersMap,
            [userId]: true
        }), {})

        return {
            total: paginatedUsersData[0].metadata.length > 0 ? paginatedUsersData[0].metadata[0].count : 0,
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

async function markUserPostAsFavorite ({ userId, postId }: MarkUserPostAsFavoriteOptions): Promise<UserFavoriteType> {
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

async function unmarkUserPostAsFavorite ({ userId, postId }: UnmarkUserPostAsFavoriteOptions): Promise<UserFavoriteType> {
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

async function getFirstLikingUserForPost ({ postId }: { postId : string }): Promise<UserType | null> {
    try {
        if (!await Post.findById(postId)) {
            return Promise.reject(getCustomValidationError('postId', `Post with id ${postId} does not exist`))
        }

        const postLikes = await PostLike.find({ postId }).sort({ createdAt: -1 })
        if (postLikes.length > 0) {
            return await User.findById(postLikes[0].userId)
        }
        return null
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        } else {
            throw err
        }
    }
}

interface GetPostsForUserOptions {
    userId: string
    offset: number
    limit: number
}

interface GetPostsForUserReturnValue {
    data: PostType[]
    total: number
}

async function getPostsForUser ({ userId, offset, limit }: GetPostsForUserOptions): Promise<GetPostsForUserReturnValue> {
    try {
        if (!await User.findById(userId)) {
            return Promise.reject(getCustomValidationError('userId', `User with id ${userId} does not exist`))
        }

        const posts = await Post.aggregate([
            {
                $match: { userId }
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
                    ]
                }
            }
        ])

        return {
            data: posts[0].data,
            total: posts[0].metadata.length > 0 ? posts[0].metadata[0].count : 0
        }
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        } else {
            throw err
        }
    }
}

interface GetLikedPostsForUserOptions {
    userId: string
    offset: number
    limit: number
}

interface GetLikedPostsForUserReturnValue {
    data: PostType[]
    total: number
}

async function getLikedPostsForUser ({ userId, offset, limit }: GetLikedPostsForUserOptions): Promise<GetLikedPostsForUserReturnValue> {
    try {
        if (!await User.findById(userId)) {
            return Promise.reject(getCustomValidationError('userId', `User with id ${userId} does not exist`))
        }

        const likedPosts = await PostLike.find({ userId }).sort({ createdAt: -1 }).select('postId')
        const likedPostsObjectIds = likedPosts.map(likedPost => new Types.ObjectId(likedPost.postId))

        const posts = await Post.aggregate([
            {
                $match: { _id: { $in: likedPostsObjectIds }}
            },
            {
                $addFields: {
                    order: {
                        $indexOfArray: [ likedPostsObjectIds, '$_id' ]
                    }
                }
            },
            {
                $sort: { order: 1 }
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
                    ]
                }
            }
        ])

        return {
            data: posts[0].data,
            total: posts[0].metadata.length > 0 ? posts[0].metadata[0].count : 0
        }
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        } else {
            throw err
        }
    }
}

interface GetFavoritePostsForUserOptions {
    userId: string
    offset: number
    limit: number
}

interface GetFavoritePostsForUserReturnValue {
    data: PostType[]
    total: number
}

async function getFavoritePostsForUser ({ userId, offset, limit }: GetFavoritePostsForUserOptions): Promise<GetFavoritePostsForUserReturnValue> {
    try {
        if (!await User.findById(userId)) {
            return Promise.reject(getCustomValidationError('userId', `User with id ${userId} does not exist`))
        }

        const favoritePosts = await UserFavorite.find({ userId }).sort({ createdAt: -1 }).select('postId')
        const favoritePostsObjectIds = favoritePosts.map(favoritePost => new Types.ObjectId(favoritePost.postId))

        const posts = await Post.aggregate([
            {
                $match: { _id: { $in: favoritePostsObjectIds }}
            },
            {
                $addFields: {
                    order: {
                        $indexOfArray: [ favoritePostsObjectIds, '$_id' ]
                    }
                }
            },
            {
                $sort: { order: 1 }
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
                    ]
                }
            }
        ])

        return {
            data: posts[0].data,
            total: posts[0].metadata.length > 0 ? posts[0].metadata[0].count : 0,
        }
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        } else {
            throw err
        }
    }
}

interface PostDetails extends PostType {
    likesCount: number
    liked: boolean
    favorite: boolean
    user: UserType
    firstLikeUser: UserType | null
}

async function getPostDetails ({ postId, userId }: { postId: string, userId: string }): Promise<PostDetails> {
    try {
        if (!await User.findById(userId)) {
            return Promise.reject(getCustomValidationError('userId', `User with id ${userId} does not exist`))
        }

        const posts = await Post.aggregate([
            {
                $addFields: { postId: { $toString: '$_id' }}
            },
            {
                $match: { postId }
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
            {
                $addFields: {
                    user: { $arrayElemAt: [ '$users', 0 ] },
                    firstLikeUser: {
                        $ifNull: [ { $arrayElemAt: [ '$firstLikeUsers', 0 ] }, null ]
                    }
                }
            }
        ])

        if (posts.length > 0) {
            return posts[0]
        } else {
            return Promise.reject(getCustomValidationError('postId', `Post with id ${postId} does not exist`))
        }

    } catch (err) {
        if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        } else {
            throw err
        }
    }
}

async function getSuggestedPosts ({ userId }: { userId: string }): Promise<PostType[]> {
    try {
        if (!await User.findById(userId)) {
            return Promise.reject(getCustomValidationError('userId', `User with id ${userId} does not exist`))
        }

        const userFollows = await Follow.find({ followingUserId: userId }).select('followedUserId')
        const followedUsersIds = userFollows.map(follow => follow.followedUserId)

        // Posts that the user or the people he follows created
        const followedUsersPosts = await Post.find({ userId: { $in: [userId, ...followedUsersIds]}}).select('_id')
        const followedUsersPostsIds = followedUsersPosts.map(post => post._id.toString())

        // Posts that the people user follows liked, but are not created by him or the people he follows
        const likedPostsCount = await PostLike.aggregate([
            {
                $match: {
                    userId: { $in: followedUsersIds },
                    postId: { $nin: followedUsersPostsIds },
                }
            },
            {
                $group: {
                    _id: '$postId',
                    count: { $count: {} }
                },
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 50,
            }
        ])

        // Posts that the people user follows marked as favorite, but are not created by him or the people he follows
        const favoritePostsCount = await UserFavorite.aggregate([
            {
                $match: {
                    userId: { $in: followedUsersIds },
                    postId: { $nin: followedUsersPostsIds },
                }
            },
            {
                $group: {
                    _id: '$postId',
                    count: { $count: {} }
                },
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 50,
            }
        ])

        // Posts that the people user follows commented on, but are not created by him or the people he follows
        const commentedPostsCount = await Comment.aggregate([
            {
                $match: {
                    userId: { $in: followedUsersIds },
                    postId: { $nin: followedUsersPostsIds },
                }
            },
            {
                $group: {
                    _id: {
                        userId: '$userId',
                        postId: '$postId',
                    },
                }
            },
            {
                $group: {
                    _id: '$_id.postId',
                    count: { $count: {} }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 50,
            }
        ])

        const followingSuggestedPostsWithCount = [
            ...likedPostsCount,
            ...favoritePostsCount,
            ...commentedPostsCount
        ].reduce((posts, post) => ({
            ...posts,
            [post._id]: (posts[post._id] ?? 0) + post.count
        }), {})
        const followingSuggestedPostsIds = Object.keys(followingSuggestedPostsWithCount)
            .sort((a, b) => followingSuggestedPostsWithCount[b] - followingSuggestedPostsWithCount[a])

        // People that have the most followers that the user does not follow (have at least 1 follower)
        const popularUsersCount = await Follow.aggregate([
            {
                $match: {
                    followedUserId: { $nin: [userId, ...followedUsersIds] }
                }
            },
            {
                $group: {
                    _id: '$followedUserId',
                    count: { $count: {} }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 50,
            }
        ])
        const popularUsersIds = popularUsersCount.map(user => user._id)

        // People that have the most followers that the user does not follow (have 0 followers)
        const otherPopularUsers = await User
            .find({
                _id: {
                    $nin: [
                        userId,
                        ...followedUsersIds.map(id => new Types.ObjectId(id)),
                        ...popularUsersIds.map(id => new Types.ObjectId(id))
                    ]
                }
            })
            .limit(50)
            .select('_id')
        const otherPopularUsersIds = otherPopularUsers.map(user => user._id.toString())

        const allPopularUsersIds = [
            ...popularUsersIds,
            ...otherPopularUsersIds,
        ]

        // Most recent posts by these people
        const popularPosts = await Post.aggregate([
            {
                $match: {
                    _id: { $nin: followingSuggestedPostsIds.map(id => new Types.ObjectId(id)) },
                    userId: { $in: allPopularUsersIds },
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: '$userId',
                    postId: {
                        $first: '$_id'
                    }
                }
            },
            {
                $limit: 50,
            }
        ])

        const postsByUser = popularPosts.reduce((posts, post) => ({
            ...posts,
            [post._id]: post.postId.toString()
        }), {})

        const popularPostsIds = allPopularUsersIds
            .filter(userId => postsByUser.hasOwnProperty(userId))
            .map(userId => postsByUser[userId])

        const suggestedPostsIds = _uniq([
            ...followingSuggestedPostsIds,
            ...popularPostsIds,
        ])

        const suggestedPosts = await Post.find({
            _id: { $in: suggestedPostsIds.map(id => new Types.ObjectId(id)) }
        })
        const suggestedPostsById: { [postId: string]: PostType } = suggestedPosts.reduce((posts, post) => ({
            ...posts,
            [post._id.toString()]: post
        }), {})

        return suggestedPostsIds.map(suggestedPostId => suggestedPostsById[suggestedPostId])

    } catch (err) {
        if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        } else {
            throw err
        }
    }
}

interface PostLikeNotification {
    _id: string
    user: UserType
    post: PostType
    createdAt: string
}

async function getPostLikeNotificationsForUser ({ userId }: { userId: string }): Promise<PostLikeNotification[]> {
    try {
        if (!await User.findById(userId)) {
            return Promise.reject(getCustomValidationError('userId', `User with id ${userId} does not exist`))
        }

        const userPosts = await Post.find({ userId }).select('_id')
        const userPostsIds = userPosts.map(post => post._id.toString())

        const fourMonthsAgo = moment().subtract(4, 'months').toDate()

        const postLikes = await PostLike.find({
            postId: { $in: userPostsIds },
            userId: { $ne: userId },
            createdAt: { $gte: fourMonthsAgo }
        }).sort({ createdAt: -1 })

        const postLikeNotifications = await PostLike.populate(postLikes, 'userId postId') as unknown as Array<{
            _id: string
            userId: UserType
            postId: PostType
            createdAt: string
        }>

        return postLikeNotifications.map(postLikeNotification => ({
            _id: postLikeNotification._id,
            user: postLikeNotification.userId,
            post: postLikeNotification.postId,
            createdAt: postLikeNotification.createdAt,
        }))
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        } else {
            throw err
        }
    }
}

interface GetPostCommentNotificationsForUserOptions {
    userId: string
    offset: number
    limit: number
}

interface PostCommentNotification {
    _id: string
    user: UserType
    post: PostType
    createdAt: string
}

interface GetPostCommentNotificationsForUserReturnValue {
    data: PostCommentNotification[]
    total: number
}

async function getPostCommentNotificationsForUser ({ userId, offset, limit }: GetPostCommentNotificationsForUserOptions): Promise<GetPostCommentNotificationsForUserReturnValue> {
    try {
        if (!await User.findById(userId)) {
            return Promise.reject(getCustomValidationError('userId', `User with id ${userId} does not exist`))
        }

        const userPosts = await Post.find({ userId }).select('_id')
        const userPostsIds = userPosts.map(post => post._id.toString())

        const fourMonthsAgo = moment().subtract(4, 'months').toDate()

        const postComments = await Comment.aggregate([
            {
                $match: {
                    postId: { $in: userPostsIds },
                    userId: { $ne: userId },
                    createdAt: { $gte: fourMonthsAgo }
                }
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
                    ]
                }
            }
        ])

        const postCommentNotifications = await PostLike.populate(postComments[0].data, 'userId postId') as unknown as Array<{
            _id: string
            userId: UserType
            postId: PostType
            createdAt: string
        }>

        return {
            total: postComments[0].metadata.length > 0 ? postComments[0].metadata[0].count : 0,
            data: postCommentNotifications.map(postLikeNotification => ({
                _id: postLikeNotification._id,
                user: postLikeNotification.userId,
                post: postLikeNotification.postId,
                createdAt: postLikeNotification.createdAt,
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

export default {
    createPost,
    createComment,
    likePost,
    unlikePost,
    likeComment,
    unlikeComment,
    getCommentsForPost,
    getFollowedUsersPosts,
    getAllFollowedUsersPosts,
    getUsersWhoLikedPost,
    getUsersWhoLikedComment,
    markUserPostAsFavorite,
    unmarkUserPostAsFavorite,
    getFirstLikingUserForPost,
    getPostsForUser,
    getLikedPostsForUser,
    getFavoritePostsForUser,
    getPostDetails,
    getSuggestedPosts,
    getPostLikeNotificationsForUser,
    getPostCommentNotificationsForUser,
}