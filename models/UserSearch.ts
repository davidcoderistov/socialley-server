import { Schema, Types, model, SchemaTimestampsConfig } from 'mongoose'


const UserSearchSchema = new Schema({
    searchingUserId: {
        type: Schema.Types.String,
        required: [true, 'Searching user is required'],
        ref: 'User'
    },
    searchedUserId: {
        type: Schema.Types.String,
        required: [true, 'Searched user is required'],
        ref: 'User'
    }
}, { timestamps: true })

export type UserSearchType = {
    _id: Types.ObjectId
    searchingUserId: string
    searchedUserId: string
} & SchemaTimestampsConfig

export default model('UserSearch', UserSearchSchema)