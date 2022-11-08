import User from '../models/User'
import bcrypt from 'bcrypt'
import { Error } from 'mongoose'
import { MongoError } from 'mongodb'
import {
    getValidationError,
    getUniqueValidationError,
    getMongoDBServerError,
    generateAccessToken,
    generateRefreshToken,
} from '../utils'


interface SignUpInput {
    username: string
    firstName: string
    lastName: string
    email: string
    password: string
}

async function signUp (signUpInput: SignUpInput) {
    try {
        const passwordHash = await bcrypt.hash(signUpInput.password, 10)
        const user = new User({
            username: signUpInput.username,
            firstName: signUpInput.firstName,
            lastName: signUpInput.lastName,
            email: signUpInput.email,
            password: passwordHash,
        })
        const createdUser = await user.save()

        const accessToken = generateAccessToken(createdUser._id.toString())
        createdUser.refreshToken = generateRefreshToken(createdUser._id.toString())

        await createdUser.save()

        createdUser.accessToken = accessToken
        return createdUser
    } catch (err) {
        if (err instanceof MongoError) {
            if (err.code === 11000) {
                throw getUniqueValidationError('username', 'Username must be unique')
            }
        } else if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        }
        throw getMongoDBServerError('Could not sign up. Please try again later')
    }
}

export default {
    signUp,
}