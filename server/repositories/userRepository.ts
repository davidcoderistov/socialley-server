import User, { UserType } from '../models/User'
import Follow from '../models/Follow'
import bcrypt from 'bcrypt'
import { Error } from 'mongoose'
import { MongoError } from 'mongodb'
import {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    getCustomValidationError,
    getMongoDBServerError,
    getValidationError,
    getInvalidSessionError,
} from '../utils'


type UserTypeWithAccessToken = UserType & { accessToken: string }

interface SignUpInput {
    username: string
    firstName: string
    lastName: string
    email: string
    password: string
}

async function signUp (signUpInput: SignUpInput): Promise<UserType> {
    try {
        if (signUpInput.password.length < 8) {
            return Promise.reject(getCustomValidationError('password', 'Password must contain at least 8 characters'))
        }
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
                throw getCustomValidationError('username', `${signUpInput.username} already exists`)
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

async function login ({ username, password }: LoginInput): Promise<UserTypeWithAccessToken> {
    try {
        const user = await User.findOne({ username })
        if (!user) {
            return Promise.reject(getCustomValidationError('username', `User ${username} does not exist`))
        }

        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) {
            return Promise.reject(getCustomValidationError('password', 'Wrong password'))
        }

        const userId = user._id.toString()
        user.refreshToken = generateRefreshToken(userId)

        await user.save()

        return {
            ...user.toObject(),
            accessToken: generateAccessToken(userId),
        }
    } catch (err) {
        throw getMongoDBServerError('Could not login. Please try again later')
    }
}

interface RefreshInput {
    refreshToken: string | undefined
}

async function refresh ({ refreshToken }: RefreshInput): Promise<UserTypeWithAccessToken> {
    try {
        if (!refreshToken) {
            return Promise.reject(getInvalidSessionError())
        }

        const decoded = await verifyToken(refreshToken)
        const { id, refresh } = decoded
        if (!id || !refresh) {
            return Promise.reject(getInvalidSessionError())
        }

        const user = await User.findById(id)
        if (!user || user.refreshToken !== refreshToken) {
            return Promise.reject(getInvalidSessionError())
        }

        user.refreshToken = generateRefreshToken(id)
        await user.save()

        return {
            ...user.toObject(),
            accessToken: generateAccessToken(id),
        }
    } catch (err) {
        throw getInvalidSessionError()
    }
}

interface LogoutInput {
    refreshToken: string | undefined
}

async function logout ({ refreshToken }: LogoutInput): Promise<UserType> {
    try {
        if (!refreshToken) {
            return Promise.reject(getInvalidSessionError())
        }

        const decoded = await verifyToken(refreshToken)
        const { id, refresh } = decoded
        if (!id || !refresh) {
            return Promise.reject(getInvalidSessionError())
        }

        const user = await User.findById(id)
        if (!user || user.refreshToken !== refreshToken) {
            return Promise.reject(getInvalidSessionError())
        }

        user.refreshToken = undefined
        return await user.save()
    } catch (err) {
        throw getInvalidSessionError()
    }
}

async function findUsersBySearchQuery ({ searchQuery, limit, userId }: { searchQuery: string, limit: number, userId: string }) {
    const regex = new RegExp(searchQuery, 'i')
    return User
        .find({
            $or: [
                { firstName: { $regex: regex } },
                { lastName: { $regex: regex } },
                { username: { $regex: regex } }
            ]})
        .where('_id').ne(userId)
        .sort('username')
        .limit(limit)
}

async function followUser ({ followingUserId, followedUserId }: { followingUserId: string, followedUserId: string }) {
    try {
        if (!await User.findById(followingUserId)) {
            return Promise.reject(getCustomValidationError('followingUserId', `User with id ${followingUserId} does not exist`))
        }

        if (!await User.findById(followingUserId)) {
            return Promise.reject(getCustomValidationError('followedUserId', `User with id ${followedUserId} does not exist`))
        }

        if ((await Follow.find({ followingUserId, followedUserId })).length > 0) {
            return Promise.reject(getCustomValidationError('followedUserId', `User ${followingUserId} already follows ${followedUserId}`))
        }

        const follow = new Follow({
            followingUserId,
            followedUserId,
        })
        return await follow.save()
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        } else {
            throw err
        }
    }
}

export default {
    signUp,
    login,
    refresh,
    logout,
    findUsersBySearchQuery,
    followUser,
}