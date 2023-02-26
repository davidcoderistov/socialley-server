import { Schema, Types, model, SchemaTimestampsConfig } from 'mongoose'


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

export type PostLikeType = {
    _id: Types.ObjectId
    postId: string
    userId: string
} & SchemaTimestampsConfig

export default model('PostLike', PostLikeSchema)