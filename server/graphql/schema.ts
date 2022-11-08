import {
    GraphQLSchema,
    GraphQLObjectType,
} from 'graphql'
import userQueries from './queries/user'
import authMutations from './mutations/auth'


const RootQuery = new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
        ...userQueries,
    },
})

const RootMutation = new GraphQLObjectType({
    name: 'RootMutation',
    fields: {
        ...authMutations,
    }
})

const schema = new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation,
})

export default schema