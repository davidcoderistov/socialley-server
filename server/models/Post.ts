import { Schema, InferSchemaType, model } from 'mongoose'


const PostSchema = new Schema({
    title: Schema.Types.String,
    photoURL: {
        type: Schema.Types.String,
        required: [true, 'Photo URL is required']
    },
    videoURL: Schema.Types.String,
    userId: {
        type: Schema.Types.String,
        required: [true, 'User is required'],
        ref: 'User'
    }
}, { timestamps: true })

export type PostType = InferSchemaType<typeof PostSchema>

export default model('Post', PostSchema)