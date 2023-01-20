import {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLNonNull,
} from 'graphql'
import { DateScalar } from '../scalars'
import PublicUser from './PublicUser'


const FullMessage = new GraphQLObjectType({
    name: 'FullMessage',
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLID) },
        fromUser: { type: new GraphQLNonNull(PublicUser) },
        toUser: { type: new GraphQLNonNull(PublicUser) },
        message: { type: GraphQLString },
        photoURL: { type: GraphQLString },
        createdAt: { type: new GraphQLNonNull(DateScalar) },
    })
})

export default FullMessage