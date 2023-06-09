import {
    ThunkObjMap,
    GraphQLFieldConfig,
    GraphQLList,
    GraphQLNonNull,
    GraphQLString,
    GraphQLInt,
    GraphQLObjectType,
} from 'graphql'
import User from '../models/User'
import FollowableUser from '../models/FollowableUser'
import FollowNotification from '../models/FollowNotification'
import { Context } from '../../types'
import userRepository from '../../repositories/userRepository'
import suggestedUsersLoader from '../../loaders/suggestedUsersLoader'
import followNotificationsLoader from '../../loaders/followNotificationsLoader'
import followingForUserLoader from '../../loaders/followingForUserLoader'
import followersForUserLoader from '../../loaders/followersForUserLoader'


const SuggestedUser = new GraphQLObjectType({
    name: 'SuggestedUser',
    fields: () => ({
        followableUser: { type: new GraphQLNonNull(FollowableUser) },
        latestFollower: { type: User },
        followedCount: { type: new GraphQLNonNull(GraphQLInt) }
    })
})

const SuggestedUsersOutput = new GraphQLObjectType({
    name: 'SuggestedUsersOutput',
    fields: () => ({
        data: { type: new GraphQLNonNull(new GraphQLList(SuggestedUser)) },
        total: { type: new GraphQLNonNull(GraphQLInt) },
    })
})

const FollowingUser = new GraphQLObjectType({
    name: 'FollowingUser',
    fields: () => ({
        followableUser: { type: new GraphQLNonNull(FollowableUser) }
    })
})

const FollowingUsersOutput = new GraphQLObjectType({
    name: 'FollowingUsersOutput',
    fields: () => ({
        data: { type: new GraphQLNonNull(new GraphQLList(FollowingUser)) },
        total: { type: new GraphQLNonNull(GraphQLInt) },
    })
})

const FollowerUser = new GraphQLObjectType({
    name: 'FollowerUser',
    fields: () => ({
        followableUser: { type: new GraphQLNonNull(FollowableUser) }
    })
})

const FollowerUsersOutput = new GraphQLObjectType({
    name: 'FollowerUsersOutput',
    fields: () => ({
        data: { type: new GraphQLNonNull(new GraphQLList(FollowerUser)) },
        total: { type: new GraphQLNonNull(GraphQLInt) },
    })
})

const UserDetails = new GraphQLObjectType({
    name: 'UserDetails',
    fields: () => ({
        followableUser: { type: new GraphQLNonNull(FollowableUser) },
        postsCount: { type: new GraphQLNonNull(GraphQLInt) },
        followingCount: { type: new GraphQLNonNull(GraphQLInt) },
        followersCount: { type: new GraphQLNonNull(GraphQLInt) },
        latestFollower: { type: User },
        followedCount: { type: new GraphQLNonNull(GraphQLInt) }
    })
})

const SearchedUser = new GraphQLObjectType({
    name: 'SearchedUser',
    fields: () => ({
        followableUser: { type: new GraphQLNonNull(FollowableUser) },
    })
})

const FollowNotificationsForUserOutput = new GraphQLObjectType({
    name: 'FollowNotificationsForUserOutput',
    fields: () => ({
        data: { type: new GraphQLNonNull(new GraphQLList(FollowNotification)) },
        total: { type: new GraphQLNonNull(GraphQLInt) },
    })
})

const userQueries: ThunkObjMap<GraphQLFieldConfig<any, Context>> = {
    getUsersBySearchQuery: {
        type: new GraphQLNonNull(new GraphQLList(User)),
        args: {
            searchQuery: { type: new GraphQLNonNull(GraphQLString) },
            limit: { type: new GraphQLNonNull(GraphQLInt) },
        },
        resolve (_, { searchQuery, limit }, { userId }) {
            return userRepository.findUsersBySearchQuery({ searchQuery, limit, userId })
        }
    },
    getSuggestedUsers: {
        type: SuggestedUsersOutput,
        args: {
            offset: { type: new GraphQLNonNull(GraphQLInt) },
            limit: { type: new GraphQLNonNull(GraphQLInt) },
        },
        resolve: async (_, { offset, limit }, { userId }) => {
            if (offset === 0) {
                suggestedUsersLoader.clear(userId)
            }
            const suggestedUsers = await suggestedUsersLoader.load(userId)
            return {
                data: suggestedUsers.map(suggestedUser => ({
                    followableUser: {
                        user: { ...suggestedUser },
                        following: false,
                    },
                    latestFollower: suggestedUser.latestFollower,
                    followedCount: suggestedUser.followedCount,
                })).slice(offset, offset + limit),
                total: suggestedUsers.length,
            }
        }
    },
    getFollowingForUser: {
        type: FollowingUsersOutput,
        args: {
            userId: { type: new GraphQLNonNull(GraphQLString) },
            offset: { type: new GraphQLNonNull(GraphQLInt) },
            limit: { type: new GraphQLNonNull(GraphQLInt) },
        },
        resolve: async (_, { userId, offset, limit }, { userId: loggedInUserId }) => {
            if (offset === 0) {
                followingForUserLoader.clear({ loggedInUserId, userId })
            }
            const following = await followingForUserLoader.load({ loggedInUserId, userId })
            return {
                total: following.length,
                data: following.slice(offset, offset + limit).map(following => ({
                    followableUser: {
                        user: following.followedUser,
                        following: following.following
                    }
                })),
            }
        }
    },
    getFollowersForUser: {
        type: FollowerUsersOutput,
        args: {
            userId: { type: new GraphQLNonNull(GraphQLString) },
            offset: { type: new GraphQLNonNull(GraphQLInt) },
            limit: { type: new GraphQLNonNull(GraphQLInt) },
        },
        resolve: async (_, { userId, offset, limit }, { userId: loggedInUserId }) => {
            if (offset === 0) {
                followersForUserLoader.clear({ loggedInUserId, userId })
            }
            const followers = await followersForUserLoader.load({ userId, loggedInUserId })
            return {
                total: followers.length,
                data: followers.slice(offset, offset + limit).map(follower => ({
                    followableUser: {
                        user: follower.followingUser,
                        following: follower.following,
                    }
                })),
            }
        }
    },
    getUserDetails: {
        type: UserDetails,
        args: { userId: { type: new GraphQLNonNull(GraphQLString) } },
        resolve: async (_, { userId }, { userId: loggedInUserId }) => {
            const userDetails = await userRepository.getUserDetails({ userId, loggedInUserId })
            return {
                followableUser: {
                    user: {
                        ...userDetails
                    },
                    following: userDetails.following
                },
                postsCount: userDetails.postsCount,
                followingCount: userDetails.followingCount,
                followersCount: userDetails.followersCount,
                latestFollower: userDetails.latestMutualFollower,
                followedCount: userDetails.mutualFollowersCount,
            }
        }
    },
    getSearchedUsers: {
        type: new GraphQLList(SearchedUser),
        args: { searchQuery: { type: new GraphQLNonNull(GraphQLString) } },
        resolve: async (_, { searchQuery }, { userId }) => {
            const searchedUsers = await userRepository.getSearchedUsers({ searchQuery, userId })
            return searchedUsers.map(searchedUser => ({
                followableUser: {
                    user: searchedUser,
                    following: searchedUser.following,
                }
            }))
        }
    },
    getSearchedUsersForUser: {
        type: new GraphQLList(User),
        resolve: (_, __, { userId }) =>
            userRepository.getSearchedUsersForUser({ userId })
    },
    getFollowNotificationsForUser: {
        type: FollowNotificationsForUserOutput,
        args: {
            offset: { type: new GraphQLNonNull(GraphQLInt) },
            limit: { type: new GraphQLNonNull(GraphQLInt) },
        },
        resolve: async (_, { offset, limit }, { userId }) => {
            if (offset === 0) {
                followNotificationsLoader.clear(userId)
            }
            const followNotifications = await followNotificationsLoader.load(userId)
            return {
                data: followNotifications.map(followNotification => ({
                    _id: followNotification._id,
                    followableUser: {
                        user: followNotification.user,
                        following: followNotification.following,
                    },
                    createdAt: followNotification.createdAt
                })).slice(offset, offset + limit),
                total: followNotifications.length,
            }
        }
    },
}

export default userQueries