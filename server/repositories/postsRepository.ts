import Post from '../models/Post'
import Comment from '../models/Comment'
import PostLike from '../models/PostLike'
import CommentLike from '../models/CommentLike'
import User, { UserType } from '../models/User'
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

export default {
    createPost,
    createComment,
    likePost,
    likeComment,
    getCommentsForPost,
}