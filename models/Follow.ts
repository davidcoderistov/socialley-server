import { Schema, Types, model, SchemaTimestampsConfig } from 'mongoose'


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

export type FollowType = {
    _id: Types.ObjectId
    followingUserId: string
    followedUserId: string
} & SchemaTimestampsConfig

export default model('Follow', FollowSchema)