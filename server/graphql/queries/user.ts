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
import { Context } from '../../types'
import userRepository from '../../repositories/userRepository'


const SuggestedUser = new GraphQLObjectType({
    name: 'SuggestedUser',
    fields: () => ({
        followableUser: { type: new GraphQLNonNull(FollowableUser) },
        latestFollower: { type: User },
        followedCount: { type: new GraphQLNonNull(GraphQLInt) }
    })
})

const FollowingUser = new GraphQLObjectType({
    name: 'FollowingUser',
    fields: () => ({
        followableUser: { type: new GraphQLNonNull(FollowableUser) }
    })
})

const FollowerUser = new GraphQLObjectType({
    name: 'FollowerUser',
    fields: () => ({
        followableUser: { type: new GraphQLNonNull(FollowableUser) }
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
        type: new GraphQLNonNull(new GraphQLList(SuggestedUser)),
        resolve: async (_, __, { userId }) => {
            const suggestedUsers = await userRepository.getSuggestedUsers({ userId })
            return suggestedUsers.map(suggestedUser => ({
                followableUser: {
                    user: { ...suggestedUser },
                    following: false,
                },
                latestFollower: suggestedUser.latestFollower,
                followedCount: suggestedUser.followedCount,
            }))
        }
    },
    getFollowingForUser: {
        type: new GraphQLNonNull(new GraphQLList(FollowingUser)),
        args: { userId: { type: new GraphQLNonNull(GraphQLString) }},
        resolve: async (_, { userId }, { userId: loggedInUserId }) => {
            const following = await userRepository.getFollowingForUser({ userId, loggedInUserId })
            return following.map(following => ({
                followableUser: {
                    user: following.followedUser,
                    following: following.following
                }
            }))
        }
    },
    getFollowersForUser: {
        type: new GraphQLNonNull(new GraphQLList(FollowerUser)),
        args: { userId: { type: new GraphQLNonNull(GraphQLString) }},
        resolve: async (_, { userId }, { userId: loggedInUserId }) => {
            const followers = await userRepository.getFollowersForUser({ userId, loggedInUserId })
            return followers.map(follower => ({
                followableUser: {
                    user: follower.followingUser,
                    following: follower.following,
                }
            }))
        }
    }
}

export default userQueries