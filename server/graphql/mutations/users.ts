import {
    ThunkObjMap,
    GraphQLFieldConfig,
    GraphQLNonNull,
    GraphQLString,
} from 'graphql'
import userRepository from '../../repositories/userRepository'
import Follow from '../models/Follow'
import { Context } from '../../types'


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
    }
}

export default usersMutations

