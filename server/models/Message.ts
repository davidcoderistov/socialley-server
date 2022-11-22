import { Schema, InferSchemaType, model } from 'mongoose'


const MessageSchema = new Schema({
    from: {
        type: Schema.Types.String,
        required: true,
    },
    to: {
        type: Schema.Types.String,
        required: true,
    },
    message: {
        type: Schema.Types.String,
        required: true,
    },
})

export type MessageType = InferSchemaType<typeof MessageSchema>

export default model('Message', MessageSchema)