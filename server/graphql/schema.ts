import {
    GraphQLSchema,
    GraphQLList,
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
} from 'graphql'


const User = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLID },
        username: { type: GraphQLString },
    })
})

const RootQuery = new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
        users: {
            type: new GraphQLList(User),
            resolve () {
                return []
            }
        }
    },
})

const schema = new GraphQLSchema({
    query: RootQuery,
})

export default schema