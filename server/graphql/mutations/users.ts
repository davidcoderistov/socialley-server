import {
    ThunkObjMap,
    GraphQLFieldConfig,
    GraphQLNonNull,
    GraphQLString,
    GraphQLObjectType,
    GraphQLInt,
} from 'graphql'
import userRepository from '../../repositories/userRepository'
import Follow from '../models/Follow'
import FollowableUser from '../models/FollowableUser'
import UserSearch from '../models/UserSearch'
import { Context } from '../../types'
import { pubsub } from '../../config/server'
import { USERS_SUBSCRIPTIONS } from '../subscriptions/users'


const ClearSearchHistoryOutput = new GraphQLObjectType({
    name: 'ClearSearchHistoryOutput',
    fields: () => ({
        deletedCount: { type: GraphQLInt }
    })
})

const usersMutations:  ThunkObjMap<GraphQLFieldConfig<any, Context>> = {
    followUser: {
        type: FollowableUser,
        args: { followedUserId: { type: new GraphQLNonNull(GraphQLString) }},
        resolve: async (_, { followedUserId }, { userId: followingUserId }) => {
            const { follow, followedUser } = await userRepository.followUser({ followingUserId, followedUserId })
            pubsub.publish(USERS_SUBSCRIPTIONS.USER_FOLLOWED, follow)
            return {
                user: followedUser,
                following: true,
            }
        }
    },
    unfollowUser: {
        type: Follow,
        args: { followedUserId: { type: new GraphQLNonNull(GraphQLString) }},
        resolve: (_, { followedUserId }, { userId: followingUserId }) =>
            userRepository.unfollowUser({ followingUserId, followedUserId })
    },
    markUserAsSearched: {
        type: UserSearch,
        args: { searchedUserId: { type: new GraphQLNonNull(GraphQLString) }},
        resolve: (_, { searchedUserId }, { userId: searchingUserId }) =>
            userRepository.markUserAsSearched({ searchingUserId, searchedUserId })
    },
    markUserAsUnsearched: {
        type: UserSearch,
        args: { searchedUserId: { type: new GraphQLNonNull(GraphQLString) }},
        resolve: (_, { searchedUserId }, { userId: searchingUserId }) =>
            userRepository.markUserAsUnsearched({ searchingUserId, searchedUserId })
    },
    clearSearchHistory: {
        type: ClearSearchHistoryOutput,
        resolve: (_, __, { userId: searchingUserId }) => ({
            deletedCount: userRepository.clearSearchHistory({ searchingUserId })
        })
    }
}

export default usersMutations

