import {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLNonNull,
} from 'graphql'
import { DateScalar } from '../scalars'
import User from './User'


const FullMessage = new GraphQLObjectType({
    name: 'FullMessage',
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLID) },
        fromUser: { type: new GraphQLNonNull(User) },
        toUser: { type: new GraphQLNonNull(User) },
        message: { type: GraphQLString },
        photoURL: { type: GraphQLString },
        createdAt: { type: new GraphQLNonNull(DateScalar) },
    })
})

export default FullMessage