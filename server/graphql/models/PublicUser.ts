import {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLNonNull,
} from 'graphql'


const PublicUser = new GraphQLObjectType({
    name: 'PublicUser',
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLID) },
        username: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        lastName: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        avatarURL: { type: GraphQLString },
    })
})

export default PublicUser