import {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLNonNull,
} from 'graphql'


const Message = new GraphQLObjectType({
    name: 'Message',
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLID) },
        fromUserId: { type: new GraphQLNonNull(GraphQLString) },
        toUserId: { type: new GraphQLNonNull(GraphQLString) },
        message: { type: GraphQLString },
        photoURL: { type: GraphQLString },
    })
})

export default Message