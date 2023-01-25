import PublicUser from '../models/PublicUser'
import {
    ThunkObjMap,
    GraphQLFieldConfig,
    GraphQLList,
    GraphQLNonNull,
    GraphQLString,
    GraphQLInt,
} from 'graphql'
import { Context } from '../types'
import userRepository from '../../repositories/userRepository'


const userQueries: ThunkObjMap<GraphQLFieldConfig<any, Context>> = {
    getUsersBySearchQuery: {
        type: new GraphQLList(PublicUser),
        args: {
            searchQuery: { type: new GraphQLNonNull(GraphQLString) },
            limit: { type: new GraphQLNonNull(GraphQLInt) },
        },
        resolve (_, { searchQuery, limit }) {
            return userRepository.findUsersBySearchQuery({ searchQuery, limit })
        }
    }
}

export default userQueries