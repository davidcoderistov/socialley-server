import { Schema, Types, model, SchemaTimestampsConfig } from 'mongoose'


const PostSchema = new Schema({
    title: Schema.Types.String,
    photoURL: {
        type: Schema.Types.String,
        required: [true, 'Photo URL is required']
    },
    userId: {
        type: Schema.Types.String,
        required: [true, 'User is required'],
        ref: 'User'
    }
}, { timestamps: true })

export type PostType = {
    _id: Types.ObjectId
    title?: string | null
    photoURL: string
    userId: string
} & SchemaTimestampsConfig

export default model('Post', PostSchema)