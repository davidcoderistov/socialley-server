import { Schema, Types, model, SchemaTimestampsConfig } from 'mongoose'


const CommentLikeSchema = new Schema({
    commentId: {
        type: Schema.Types.String,
        required: [true, 'Comment is required'],
        ref: 'Comment'
    },
    userId: {
        type: Schema.Types.String,
        required: [true, 'User is required'],
        ref: 'User'
    }
}, { timestamps: true })

export type CommentLikeType = {
    _id: Types.ObjectId
    commentId: string
    userId: string
} & SchemaTimestampsConfig

export default model('CommentLike', CommentLikeSchema)