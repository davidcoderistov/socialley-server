import {
    GraphQLSchema,
    GraphQLObjectType,
} from 'graphql'
import userQueries from './queries/user'
import authMutations from './mutations/auth'
import messagesMutations from './mutations/messages'


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
        ...messagesMutations,
    }
})

const schema = new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation,
})

export default schema