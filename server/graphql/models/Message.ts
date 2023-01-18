import {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLNonNull,
} from 'graphql'
import { DateScalar } from '../scalars'


const Message = new GraphQLObjectType({
    name: 'Message',
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLID) },
        fromUserId: { type: new GraphQLNonNull(GraphQLString) },
        toUserId: { type: new GraphQLNonNull(GraphQLString) },
        message: { type: GraphQLString },
        photoURL: { type: GraphQLString },
        createdAt: { type: new GraphQLNonNull(DateScalar) },
    })
})

export default Message