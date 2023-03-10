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
import UserSearch from '../models/UserSearch'
import { Context } from '../../types'


const ClearSearchHistoryOutput = new GraphQLObjectType({
    name: 'ClearSearchHistoryOutput',
    fields: () => ({
        deletedCount: { type: GraphQLInt }
    })
})

const usersMutations:  ThunkObjMap<GraphQLFieldConfig<any, Context>> = {
    followUser: {
        type: Follow,
        args: { followedUserId: { type: new GraphQLNonNull(GraphQLString) }},
        resolve: (_, { followedUserId }, { userId: followingUserId }) =>
            userRepository.followUser({ followingUserId, followedUserId })
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

