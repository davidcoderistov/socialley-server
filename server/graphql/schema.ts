import {
    GraphQLSchema,
    GraphQLObjectType,
} from 'graphql'
import userQueries from './queries/user'
import messagesQueries from './queries/messages'
import authMutations from './mutations/auth'
import messagesMutations from './mutations/messages'
import messagesSubscriptions from './subscriptions/messages'


const Query = new GraphQLObjectType({
    name: 'Query',
    fields: {
        ...userQueries,
        ...messagesQueries,
    },
})

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        ...authMutations,
        ...messagesMutations,
    }
})

const Subscription = new GraphQLObjectType({
    name: 'Subscription',
    fields: {
        ...messagesSubscriptions,
    }
})

const schema = new GraphQLSchema({
    query: Query,
    mutation: Mutation,
    subscription: Subscription,
})

export default schema