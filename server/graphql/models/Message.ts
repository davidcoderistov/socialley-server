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
        from: { type: new GraphQLNonNull(GraphQLString) },
        to: { type: new GraphQLNonNull(GraphQLString) },
        message: { type: new GraphQLNonNull(GraphQLString) },
    })
})

export default Message