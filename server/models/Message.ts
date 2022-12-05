import {
    Schema,
    InferSchemaType,
    model,
    Error
} from 'mongoose'


const MessageSchema = new Schema({
    fromUserId: {
        type: Schema.Types.String,
        required: true,
        ref: 'User',
    },
    toUserId: {
        type: Schema.Types.String,
        required: true,
        ref: 'User',
    },
    message: Schema.Types.String,
    photoURL: Schema.Types.String,
}, { timestamps: true })

MessageSchema.pre('validate', function(next) {
    if ((this.message && this.photoURL) || (!this.message && !this.photoURL)) {
        return next(new Error('At least and only one field(message, photoURL) should be present'))
    }
    next()
})

export type MessageType = InferSchemaType<typeof MessageSchema>

export default model('Message', MessageSchema)