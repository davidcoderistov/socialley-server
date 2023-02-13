import { Schema, InferSchemaType, model } from 'mongoose'


const FollowSchema = new Schema({
    followingUserId: {
        type: Schema.Types.String,
        required: [true, 'Following user is required'],
        ref: 'User'
    },
    followedUserId: {
        type: Schema.Types.String,
        required: [true, 'Followed user is required'],
        ref: 'User'
    }
}, { timestamps: true })

export type FollowType = InferSchemaType<typeof FollowSchema>

export default model('Follow', FollowSchema)