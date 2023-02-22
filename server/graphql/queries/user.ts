import PublicUser from '../models/PublicUser'
import {
    ThunkObjMap,
    GraphQLFieldConfig,
    GraphQLList,
    GraphQLNonNull,
    GraphQLString,
    GraphQLInt,
    GraphQLObjectType,
    GraphQLID,
} from 'graphql'
import { Context } from '../types'
import userRepository from '../../repositories/userRepository'


const SuggestedUser = new GraphQLObjectType({
    name: 'SuggestedUser',
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLID) },
        username: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        lastName: { type: new GraphQLNonNull(GraphQLString) },
        avatarURL: { type: GraphQLString },
        latestFollower: { type: PublicUser },
        followedCount: { type: new GraphQLNonNull(GraphQLInt) }
    })
})
const userQueries: ThunkObjMap<GraphQLFieldConfig<any, Context>> = {
    getUsersBySearchQuery: {
        type: new GraphQLList(PublicUser),
        args: {
            searchQuery: { type: new GraphQLNonNull(GraphQLString) },
            limit: { type: new GraphQLNonNull(GraphQLInt) },
        },
        resolve (_, { searchQuery, limit }, { userId }) {
            return userRepository.findUsersBySearchQuery({ searchQuery, limit, userId })
        }
    },
    getSuggestedUsers: {
        type: new GraphQLList(SuggestedUser),
        resolve: (_, __, { userId }) => userRepository.getSuggestedUsers({ userId })
    }
}

export default userQueries