import { Schema, Types, model, SchemaTimestampsConfig } from 'mongoose'


const CommentSchema = new Schema({
    text: {
        type: Schema.Types.String,
        required: [true, 'Comment text is required']
    },
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

export type CommentType = {
    _id: Types.ObjectId
    postId: string
    userId: string
} & SchemaTimestampsConfig

export default model('Comment', CommentSchema)