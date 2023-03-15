import User, { UserType } from '../models/User'
import Follow, { FollowType } from '../models/Follow'
import UserSearch, { UserSearchType } from '../models/UserSearch'
import Post from '../models/Post'
import PostLike from '../models/PostLike'
import Comment from '../models/Comment'
import bcrypt from 'bcrypt'
import mongoose, { Error } from 'mongoose'
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
import moment from 'moment'


interface SignUpOptions {
    username: string
    firstName: string
    lastName: string
    email: string
    password: string
}

type SignUpReturnValue = Omit<UserType, 'avatarURL' | 'accessToken' | 'refreshToken'>

async function signUp (signUpInput: SignUpOptions): Promise<SignUpReturnValue> {
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

interface LoginOptions {
    username: string
    password: string
}

interface LoginReturnValue extends Omit<UserType, 'accessToken' | 'refreshToken'> {
    accessToken: string
    refreshToken: string
}

async function login ({ username, password }: LoginOptions): Promise<LoginReturnValue> {
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

interface RefreshOptions {
    refreshToken: string | undefined
}

interface RefreshReturnValue extends Omit<UserType, 'accessToken' | 'refreshToken'> {
    accessToken: string
    refreshToken: string
}

async function refresh ({ refreshToken }: RefreshOptions): Promise<RefreshReturnValue> {
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

interface LogoutOptions {
    refreshToken: string | undefined
}

type LogoutReturnValue = Omit<UserType, 'accessToken' | 'refreshToken'>

async function logout ({ refreshToken }: LogoutOptions): Promise<LogoutReturnValue> {
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

interface EditUserOptions {
    _id: string
    firstName: string
    lastName: string
    username: string
    email: string
}

async function editUser (editUserOptions: EditUserOptions): Promise<UserType> {
    try {
        const findUser = await User.findById(editUserOptions._id)

        if (!findUser) {
            return Promise.reject(getCustomValidationError('userId', `User with id ${editUserOptions._id} does not exist`))
        }

        if (findUser.username !== editUserOptions.username) {
            if (await User.findOne({ username: editUserOptions.username })) {
                return Promise.reject(getCustomValidationError('username', `User ${editUserOptions.username} already exists`))
            }
        }

        findUser.firstName = editUserOptions.firstName
        findUser.lastName = editUserOptions.lastName
        findUser.username = editUserOptions.username
        findUser.email = editUserOptions.email

        findUser.refreshToken = generateRefreshToken(editUserOptions._id)

        await findUser.save()

        return {
            ...findUser.toObject(),
            accessToken: generateAccessToken(editUserOptions._id),
        }
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        } else {
            throw err
        }
    }
}

interface ChangePasswordOptions {
    username: string
    oldPassword: string
    newPassword: string
    confirmNewPassword: string
}

async function changePassword ({ username, oldPassword, newPassword, confirmNewPassword }: ChangePasswordOptions): Promise<UserType> {
    try {
        const findUser = await User.findOne({ username })

        if (!findUser) {
            return Promise.reject(getCustomValidationError('username', `User ${username} does not exist`))
        }

        if (oldPassword.length < 8) {
            return Promise.reject(getCustomValidationError('oldPassword', 'Old password must contain at least 8 characters'))
        }

        if (newPassword.length < 8) {
            return Promise.reject(getCustomValidationError('newPassword', 'New password must contain at least 8 characters'))
        }

        if (confirmNewPassword.length < 8) {
            return Promise.reject(getCustomValidationError('confirmNewPassword', 'Confirm new password must contain at least 8 characters'))
        }

        if (newPassword !== confirmNewPassword) {
            return Promise.reject(getCustomValidationError('confirmNewPassword', 'Passwords do not match'))
        }

        const passwordMatch = await bcrypt.compare(oldPassword, findUser.password)
        if (!passwordMatch) {
            return Promise.reject(getCustomValidationError('oldPassword', 'Wrong old password'))
        }

        const userId = findUser._id.toString()
        findUser.password = await bcrypt.hash(newPassword, 10)
        findUser.refreshToken = generateRefreshToken(userId)

        await findUser.save()

        return {
            ...findUser.toObject(),
            accessToken: generateAccessToken(userId),
        }
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        } else {
            throw err
        }
    }
}

interface FindUsersBySearchQueryOptions {
    userId: string
    searchQuery: string
    limit: number
}

type FindUsersBySearchQueryReturnValue = Omit<UserType, 'accessToken' | 'refreshToken'>[]

async function findUsersBySearchQuery ({ searchQuery, limit, userId }: FindUsersBySearchQueryOptions): Promise<FindUsersBySearchQueryReturnValue> {
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

interface FollowUserOptions {
    followingUserId: string
    followedUserId: string
}

async function followUser ({ followingUserId, followedUserId }: FollowUserOptions): Promise<FollowType> {
    try {
        if (!await User.findById(followingUserId)) {
            return Promise.reject(getCustomValidationError('followingUserId', `User with id ${followingUserId} does not exist`))
        }

        if (!await User.findById(followedUserId)) {
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

interface UnfollowUserOptions {
    followingUserId: string
    followedUserId: string
}

async function unfollowUser ({ followingUserId, followedUserId }: UnfollowUserOptions): Promise<FollowType> {
    try {
        if (!await User.findById(followingUserId)) {
            return Promise.reject(getCustomValidationError('followingUserId', `User with id ${followingUserId} does not exist`))
        }

        if (!await User.findById(followedUserId)) {
            return Promise.reject(getCustomValidationError('followedUserId', `User with id ${followedUserId} does not exist`))
        }

        const follow = await Follow.findOneAndDelete({ followingUserId, followedUserId })

        if (!follow) {
            return Promise.reject(getCustomValidationError('followedUserId', `User with id ${followedUserId} does not exist`))
        }

        return follow
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        } else {
            throw err
        }
    }
}

interface GetSuggestedUsersOptions {
    userId: string
}

interface SuggestedUser {
    _id: mongoose.Types.ObjectId
    username: string
    firstName: string
    lastName: string
    avatarURL: string | null
    latestFollower: Omit<UserType, 'password' | 'accessToken' | 'refreshToken'> | null
    followedCount: number
}

type GetSuggestedUsersReturnValue = SuggestedUser[]

async function getSuggestedUsers ({ userId }: GetSuggestedUsersOptions): Promise<GetSuggestedUsersReturnValue> {
    try {
        if (!await User.findById(userId)) {
            return Promise.reject(getCustomValidationError('userId', `User with id ${userId} does not exist`))
        }

        const userFollows = await Follow.find({ followingUserId: userId }).select('followedUserId')
        const followedUsersIds = userFollows.map(follow => follow.followedUserId)

        // Find the users that are followed by the people the user follows and count them by how many of my followers follow them
        const usersWithFollowedCount = await Follow.aggregate([
            {
                $match: {
                    followingUserId: { $in: followedUsersIds },
                    followedUserId: {
                        $ne: userId,
                        $nin: followedUsersIds
                    }
                }
            },
            {
                $group: {
                    _id: '$followedUserId',
                    count: { $count: {} }
                },
            }
        ])

        // Post ids that my followers and the user liked
        const userPostLikesIds = await PostLike.find({
            $or: [
                { userId: { $in: followedUsersIds }},
                { userId }
            ]
        }).distinct('postId')

        // Find all the people that liked the posts that the user and his followers liked and group them by number of liked posts
        const usersWithPostLikesCount = await PostLike.aggregate([
            {
                $match: {
                    postId: { $in: userPostLikesIds },
                    userId: {
                        $ne: userId,
                        $nin: followedUsersIds
                    }
                }
            },
            {
                $group: {
                    _id: '$userId',
                    count: { $count: {} }
                },
            }
        ])

        // Find all the people that commented on the posts that the user and his followers liked and group them by number of comments
        // All comments on a given post are given a count of 1
        const usersWithCommentsCount = await Comment.aggregate([
            {
                $match: {
                    postId: { $in: userPostLikesIds },
                    userId: {
                        $ne: userId,
                        $nin: followedUsersIds
                    }
                }
            },
            {
                $group: {
                    _id: {
                        userId: '$userId',
                        postId: '$postId',
                    },
                }
            },
            {
                $group: {
                    _id: '$_id.userId',
                    count: { $count: {} }
                }
            }
        ])

        const suggestedUsersWithCount = [
            ...usersWithFollowedCount,
            ...usersWithPostLikesCount,
            ...usersWithCommentsCount
        ].reduce((users, user) => ({
            ...users,
            [user._id]: (users[user._id] ?? 0) + user.count
        }), {})

        const suggestedUsersIds = Object.keys(suggestedUsersWithCount)

        const suggestedUsers = await User.aggregate([
            {
                $addFields: {
                    _userId: { $toString: '$_id' }
                }
            },
            {
                $match: {
                    _userId: { $in: suggestedUsersIds }
                }
            },
            {
                $lookup: {
                    from: Follow.collection.name,
                    localField: '_userId',
                    foreignField: 'followedUserId',
                    as: 'follows'
                }
            },
            {
                $unwind: {
                    path: '$follows',
                    preserveNullAndEmptyArrays: true,
                }
            },
            {
                $sort: {
                    'follows.createdAt': -1
                }
            },
            {
                $addFields: {
                    isFollowed: {
                        $in: ['$follows.followingUserId', followedUsersIds]
                    }
                }
            },
            {
                $group: {
                    _id: '$_id',
                    firstName: { $first: '$firstName' },
                    lastName: { $first: '$lastName' },
                    avatarURL: { $first: '$avatarURL' },
                    username: { $first: '$username' },
                    latestFollowerId: {
                        $first: {
                            $cond: {
                                if: { $in: ['$follows.followingUserId', followedUsersIds] },
                                then: '$follows.followingUserId',
                                else: null
                            }
                        }
                    },
                    followedCount: {
                        $sum: {
                            $cond: {
                                if: { $eq: ['$isFollowed', true] },
                                then: 1,
                                else: 0
                            }
                        }
                    }
                }
            },
            {
                $limit: 15
            },
            {
                $addFields: {
                    latestFollowerObjectId: {
                        $cond: {
                            if: { $ne: [ '$latestFollowerId', null ] },
                            then: { $toObjectId: '$latestFollowerId' },
                            else: null
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: User.collection.name,
                    localField: 'latestFollowerObjectId',
                    foreignField: '_id',
                    as: 'followers'
                }
            },
        ])

        return suggestedUsers
            .sort((a, b) => suggestedUsersWithCount[b._id] - suggestedUsersWithCount[a._id])
            .map(user => ({
                ...user,
                latestFollower: Array.isArray(user.followers) && user.followers.length > 0 ? user.followers[0] : null,
            }))

    } catch (err) {
        if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        } else {
            throw err
        }
    }
}

interface GetFollowingForUserOptions {
    userId: string
    loggedInUserId: string
    offset: number
    limit: number
}

interface UserFollowing {
    _id: string
    followingUserId: string
    followedUser: UserType
    following: boolean
    createdAt: string
}

interface GetFollowingForUserReturnValue {
    data: UserFollowing[]
    total: number
}

async function getFollowingForUser ({ userId, loggedInUserId, offset, limit }: GetFollowingForUserOptions): Promise<GetFollowingForUserReturnValue> {
    try {
        if (!await User.findById(userId)) {
            return Promise.reject(getCustomValidationError('userId', `User with id ${userId} does not exist`))
        }

        if (!await User.findById(loggedInUserId)) {
            return Promise.reject(getCustomValidationError('userId', `User with id ${loggedInUserId} does not exist`))
        }

        const userFollowsForLoggedInUser = await Follow.find({ followingUserId: loggedInUserId }).select('followedUserId')
        const followedUsersIdsForLoggedInUser = userFollowsForLoggedInUser.map(follow => follow.followedUserId)
        followedUsersIdsForLoggedInUser.push(loggedInUserId)

        const followingAggregateData = await Follow.aggregate([
            {
                $match: { followingUserId: userId }
            },
            {
                $addFields: {
                    following: { $in: ['$followedUserId', followedUsersIdsForLoggedInUser] },
                }
            },
            {
                $sort: { following: -1, createdAt: -1 }
            },
            {
                $facet: {
                    metadata: [{
                        $count: 'count'
                    }],
                    data: [
                        {
                            $skip: offset,
                        },
                        {
                            $limit: limit,
                        },
                        {
                            $addFields: {
                                followedUserObjectId: { $toObjectId: '$followedUserId' }
                            }
                        },
                        {
                            $lookup: {
                                from: User.collection.name,
                                localField: 'followedUserObjectId',
                                foreignField: '_id',
                                as: 'followedUsers'
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                followingUserId: 1,
                                followedUser: { $ifNull: [ { $arrayElemAt: [ '$followedUsers', 0 ] }, null ] },
                                following: 1,
                                createdAt: 1,
                            }
                        },
                    ]
                }
            }
        ])

        return {
            data: followingAggregateData[0].data,
            total: followingAggregateData[0].metadata.length > 0 ? followingAggregateData[0].metadata[0].count : 0,
        }
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        } else {
            throw err
        }
    }
}

interface GetFollowersForUserOptions {
    userId: string
    loggedInUserId: string
    offset: number
    limit: number
}

interface UserFollower {
    _id: string
    followedUserId: string
    followingUser: UserType
    following: boolean
    createdAt: string
}

interface GetFollowersForUserReturnValue {
    data: UserFollower[]
    total: number
}

async function getFollowersForUser ({ userId, loggedInUserId, offset, limit }: GetFollowersForUserOptions): Promise<GetFollowersForUserReturnValue> {
    try {
        if (!await User.findById(userId)) {
            return Promise.reject(getCustomValidationError('userId', `User with id ${userId} does not exist`))
        }

        if (!await User.findById(loggedInUserId)) {
            return Promise.reject(getCustomValidationError('userId', `User with id ${loggedInUserId} does not exist`))
        }

        const userFollowsForLoggedInUser = await Follow.find({ followingUserId: loggedInUserId }).select('followedUserId')
        const followedUsersIdsForLoggedInUser = userFollowsForLoggedInUser.map(follow => follow.followedUserId)
        followedUsersIdsForLoggedInUser.push(loggedInUserId)

        const followersAggregateData = await Follow.aggregate([
            {
                $match: { followedUserId: userId }
            },
            {
                $addFields: {
                    following: { $in: ['$followingUserId', followedUsersIdsForLoggedInUser] },
                }
            },
            {
                $sort: { following: -1, createdAt: -1 }
            },
            {
                $facet: {
                    metadata: [{
                        $count: 'count'
                    }],
                    data: [
                        {
                            $skip: offset,
                        },
                        {
                            $limit: limit,
                        },
                        {
                            $addFields: {
                                followingUserObjectId: { $toObjectId: '$followingUserId' }
                            }
                        },
                        {
                            $lookup: {
                                from: User.collection.name,
                                localField: 'followingUserObjectId',
                                foreignField: '_id',
                                as: 'followingUsers'
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                followedUserId: 1,
                                followingUser: { $ifNull: [ { $arrayElemAt: [ '$followingUsers', 0 ] }, null ] },
                                following: 1,
                                createdAt: 1,
                            }
                        },
                    ]
                }
            }
        ])

        return {
            data: followersAggregateData[0].data,
            total: followersAggregateData[0].metadata.length > 0 ? followersAggregateData[0].metadata[0].count : 0,
        }
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        } else {
            throw err
        }
    }
}

interface GetUserDetailsOptions {
    userId: string
    loggedInUserId: string
}

interface UserDetails extends UserType {
    postsCount: number
    followingCount: number
    followersCount: number
    following: boolean
    mutualFollowersCount: number
    latestMutualFollower: UserType | null
}

async function getUserDetails ({ userId, loggedInUserId }: GetUserDetailsOptions): Promise<UserDetails> {
    try {
        const user = await User.findById(userId)

        if (!user) {
            return Promise.reject(getCustomValidationError('userId', `User with id ${userId} does not exist`))
        }

        if (!await User.findById(loggedInUserId)) {
            return Promise.reject(getCustomValidationError('userId', `User with id ${loggedInUserId} does not exist`))
        }

        const postsCount = await Post.countDocuments({ userId })
        const followingCount = await Follow.countDocuments({ followingUserId: userId })
        const followersCount = await Follow.countDocuments({ followedUserId: userId })

        let following = false
        let mutualFollowersCount = 0
        let latestMutualFollower = null

        if (userId !== loggedInUserId) {
            const findFollowing = await Follow.find({ followingUserId: loggedInUserId, followedUserId: userId })
            following = findFollowing.length > 0

            const userFollows = await Follow.find({ followingUserId: loggedInUserId }).select('followedUserId')
            const followedUsersIds = userFollows.map(follow => follow.followedUserId)

            const mutualFollowers = await Follow.find({
                $and: [
                    { followedUserId: userId },
                    { followingUserId: { $in: followedUsersIds }}
                ]
            }).sort({ createdAt: -1 })

            mutualFollowersCount = mutualFollowers.length
            if (mutualFollowersCount > 0) {
                latestMutualFollower = await User.findById(mutualFollowers[0].followingUserId)
            }
        }

        return {
            ...user.toObject(),
            postsCount,
            followingCount,
            followersCount,
            following,
            mutualFollowersCount,
            latestMutualFollower,
        }
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        } else {
            throw err
        }
    }
}

interface GetSearchedUsersOptions {
    searchQuery: string
    userId: string
}

interface SearchedUser extends UserType {
    following: boolean
}

async function getSearchedUsers ({ searchQuery, userId }: GetSearchedUsersOptions): Promise<SearchedUser[]> {
    try {
        if (!await User.findById(userId)) {
            return Promise.reject(getCustomValidationError('userId', `User with id ${userId} does not exist`))
        }

        const userFollows = await Follow.find({ followingUserId: userId }).select('followedUserId')
        const followedUsersIds = userFollows.map(follow => follow.followedUserId)

        const regex = new RegExp(searchQuery, 'i')
        return User.aggregate([
            {
                $addFields: {
                    userId: {
                        $toString: '$_id'
                    }
                }
            },
            {
                $match: {
                    $and: [
                        { userId: { $ne: userId }},
                        {
                            $or: [
                                { firstName: { $regex: regex } },
                                { lastName: { $regex: regex } },
                                { username: { $regex: regex } }
                            ]
                        }
                    ]
                }
            },
            {
                $sort: { username: 1 }
            },
            {
                $limit: 15
            },
            {
                $addFields: {
                    following: {
                        $in: ['$userId', followedUsersIds]
                    }
                }
            }
        ])
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        } else {
            throw err
        }
    }
}

interface MarkUserAsSearchedOptions {
    searchingUserId: string
    searchedUserId: string
}

async function markUserAsSearched ({ searchingUserId, searchedUserId }: MarkUserAsSearchedOptions): Promise<UserSearchType> {
    try {
        if (!await User.findById(searchingUserId)) {
            return Promise.reject(getCustomValidationError('searchingUserId', `User with id ${searchingUserId} does not exist`))
        }

        if (!await User.findById(searchedUserId)) {
            return Promise.reject(getCustomValidationError('searchedUserId', `User with id ${searchedUserId} does not exist`))
        }

        await UserSearch.findOneAndDelete({ searchingUserId, searchedUserId })

        const userSearch = new UserSearch({
            searchingUserId,
            searchedUserId,
        })
        return await userSearch.save()
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        } else {
            throw err
        }
    }
}

interface MarkUserAsUnsearchedOptions {
    searchingUserId: string
    searchedUserId: string
}

async function markUserAsUnsearched ({ searchingUserId, searchedUserId }: MarkUserAsUnsearchedOptions): Promise<UserSearchType> {
    try {
        if (!await User.findById(searchingUserId)) {
            return Promise.reject(getCustomValidationError('searchingUserId', `User with id ${searchingUserId} does not exist`))
        }

        if (!await User.findById(searchedUserId)) {
            return Promise.reject(getCustomValidationError('searchedUserId', `User with id ${searchedUserId} does not exist`))
        }

        const userSearch = await UserSearch.findOneAndDelete({ searchingUserId, searchedUserId })

        if (!userSearch) {
            return Promise.reject(getCustomValidationError('searchedUserId', `User with id ${searchedUserId} is not searched`))
        }

        return userSearch
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        } else {
            throw err
        }
    }
}

async function clearSearchHistory ({ searchingUserId }: { searchingUserId: string }): Promise<number> {
    try {
        if (!await User.findById(searchingUserId)) {
            return Promise.reject(getCustomValidationError('searchingUserId', `User with id ${searchingUserId} does not exist`))
        }

        const deletedUserSearches = await UserSearch.deleteMany({ searchingUserId })
        return deletedUserSearches.deletedCount
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        } else {
            throw err
        }
    }
}

async function getSearchedUsersForUser ({ userId }: { userId: string }): Promise<UserType[]> {
    try {
        if (!await User.findById(userId)) {
            return Promise.reject(getCustomValidationError('userId', `User with id ${userId} does not exist`))
        }

        const userSearches = await UserSearch
            .find({ searchingUserId: userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('searchedUserId')

        const searchUserObjectIds = userSearches.map(userSearch => new mongoose.Types.ObjectId(userSearch.searchedUserId))

        const searchedUsers = await User.find({ _id: { $in: searchUserObjectIds }})
        const searchedUsersByUser = searchedUsers.reduce((acc, searchedUser) => ({
            ...acc,
            [searchedUser._id.toString()]: searchedUser
        }), {})

        return searchUserObjectIds.map(searchUserObjectId => searchedUsersByUser[searchUserObjectId.toString()])
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        } else {
            throw err
        }
    }
}

interface FollowNotification {
    _id: string
    user: UserType
    following: boolean
    createdAt: string
}

async function getFollowNotificationsForUser ({ userId }: { userId: string }): Promise<FollowNotification[]> {
    try {
        if (!await User.findById(userId)) {
            return Promise.reject(getCustomValidationError('userId', `User with id ${userId} does not exist`))
        }

        const followedUsers = await Follow.find({ followingUserId: userId }).select('followedUserId')
        const followedUsersIds = followedUsers.map(follow => follow.followedUserId)
        const followedUsersIdsMap = followedUsersIds.reduce((usersMap, userId) => ({
            ...usersMap,
            [userId]: true
        }), {})

        const fourMonthsAgo = moment().subtract(4, 'months').toDate()

        const userFollows = await Follow.find({
            followedUserId: userId,
            createdAt: { $gte: fourMonthsAgo }
        }).sort({ createdAt: -1 })

        const followNotifications = await Follow.populate(userFollows, 'followingUserId') as unknown as Array<{
            _id: string
            followingUserId: UserType
            createdAt: string
        }>

        return followNotifications.map(followNotification => ({
            _id: followNotification._id,
            user: followNotification.followingUserId,
            following: followedUsersIdsMap.hasOwnProperty(followNotification.followingUserId._id.toString()),
            createdAt: followNotification.createdAt,
        }))
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        } else {
            throw err
        }
    }
}

interface FollowableUser {
    user: UserType
    following: boolean
}

async function getFollowableUser ({ followableUserId, userId }: { followableUserId: string, userId: string }): Promise<FollowableUser> {
    try {
        const followableUser = await User.findById(followableUserId)
        if (!followableUser) {
            return Promise.reject(getCustomValidationError('userId', `User with id ${followableUserId} does not exist`))
        }

        const following = await Follow.findOne({ followingUserId: userId, followedUserId: followableUserId })
        return {
            user: followableUser,
            following: !!following,
        }
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
    editUser,
    changePassword,
    findUsersBySearchQuery,
    followUser,
    unfollowUser,
    getSuggestedUsers,
    getFollowingForUser,
    getFollowersForUser,
    getUserDetails,
    getSearchedUsers,
    markUserAsSearched,
    markUserAsUnsearched,
    clearSearchHistory,
    getSearchedUsersForUser,
    getFollowNotificationsForUser,
    getFollowableUser,
}