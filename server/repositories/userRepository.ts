import User, { UserType } from '../models/User'
import bcrypt from 'bcrypt'
import { Error } from 'mongoose'
import { MongoError } from 'mongodb'
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    getCustomValidationError,
    getMongoDBServerError,
    getValidationError,
    getInvalidSessionError,
} from '../utils'


interface SignUpInput {
    username: string
    firstName: string
    lastName: string
    email: string
    password: string
}

async function signUp (signUpInput: SignUpInput): Promise<UserType> {
    try {
        const passwordHash = await bcrypt.hash(signUpInput.password, 10)
        const user = new User({
            username: signUpInput.username,
            firstName: signUpInput.firstName,
            lastName: signUpInput.lastName,
            email: signUpInput.email,
            password: passwordHash,
        })
        return await user.save()
    } catch (err) {
        if (err instanceof MongoError) {
            if (err.code === 11000) {
                throw getCustomValidationError('username', 'Username must be unique')
            }
        } else if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        }
        throw getMongoDBServerError('Could not sign up. Please try again later')
    }
}

interface LoginInput {
    username: string
    password: string
}

async function login ({ username, password }: LoginInput): Promise<UserType> {
    try {
        const user = await User.findOne({ username })
        if (!user) {
            return Promise.reject(getCustomValidationError('username', `User ${username} does not exist`))
        }

        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) {
            return Promise.reject(getCustomValidationError('password', 'Passwords do not match'))
        }

        const userId = user._id.toString()
        user.refreshToken = generateRefreshToken(userId)

        await user.save()

        user.accessToken = generateAccessToken(userId)
        return user
    } catch (err) {
        throw getMongoDBServerError('Could not login. Please try again later')
    }
}

interface RefreshInput {
    refreshToken: string | undefined
}

async function refresh ({ refreshToken }: RefreshInput): Promise<{ accessToken: string }> {
    try {
        if (!refreshToken) {
            return Promise.reject(getInvalidSessionError())
        }

        const decoded = await verifyRefreshToken(refreshToken)
        const { id, refresh } = decoded as { id: string, refresh?: boolean }
        if (!id || !refresh) {
            return Promise.reject(getInvalidSessionError())
        }

        const user = await User.findById(id)
        if (!user || user.refreshToken !== refreshToken) {
            return Promise.reject(getInvalidSessionError())
        }

        user.refreshToken = generateRefreshToken(id)
        await user.save()

        return { accessToken: generateAccessToken(id) }
    } catch (err) {
        throw getInvalidSessionError()
    }
}

export default {
    signUp,
    login,
    refresh,
}