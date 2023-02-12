import Post from '../models/Post'
import Comment from '../models/Comment'
import PostLike from '../models/PostLike'
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

export default {
    createPost,
    createComment,
    likePost,
}