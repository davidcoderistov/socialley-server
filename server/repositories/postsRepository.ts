import Post from '../models/Post'
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
            return Promise.reject(getCustomValidationError('to', `User with id ${userId} does not exist`))
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

export default {
    createPost,
}