import { Schema, InferSchemaType, model } from 'mongoose'


const UserFavoriteSchema = new Schema({
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

export type UserFavoriteType = InferSchemaType<typeof UserFavoriteSchema>

export default model('UserFavorite', UserFavoriteSchema)