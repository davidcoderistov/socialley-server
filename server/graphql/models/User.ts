import {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
} from 'graphql'


const User = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        _id: { type: GraphQLID },
        username: { type: GraphQLString },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
    })
})

export default User