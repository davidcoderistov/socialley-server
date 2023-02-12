import { Schema, InferSchemaType, model } from 'mongoose'


const PostLikeSchema = new Schema({
    postId: {
        type: Schema.Types.String,
        required: [true, 'Post is required'],
        ref: 'Post'
    },
    userId: {
        type: Schema.Types.String,
        required: [true, 'User is required'],
        ref: 'User'
    }
}, { timestamps: true })

export type PostLikeType = InferSchemaType<typeof PostLikeSchema>

export default model('PostLike', PostLikeSchema)