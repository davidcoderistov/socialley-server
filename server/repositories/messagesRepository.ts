import Message from '../models/Message'
import User from '../models/User'
import { Error } from 'mongoose'
import { getValidationError, getCustomValidationError } from '../utils'


interface CreateInput {
    from: string
    to: string
    message: string
}

async function create (createInput: CreateInput) {
    try {
        if (!await User.findById(createInput.to)) {
            return Promise.reject(getCustomValidationError('to', `User with id ${createInput.to} does not exist`))
        }
        const message = new Message(createInput)
        return await message.save()
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        } else {
            throw err
        }
    }
}

export default {
    create,
}