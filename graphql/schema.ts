import {
    GraphQLSchema,
    GraphQLObjectType,
} from 'graphql'
import userQueries from './queries/user'
import messagesQueries from './queries/messages'
import postsQueries from './queries/posts'
import authMutations from './mutations/auth'
import usersMutations from './mutations/users'
import messagesMutations from './mutations/messages'
import postsMutations from './mutations/posts'
import messagesSubscriptions from './subscriptions/messages'
import postsSubscriptions from './subscriptions/posts'
import usersSubscriptions from './subscriptions/users'


const Query = new GraphQLObjectType({
    name: 'Query',
    fields: {
        ...userQueries,
        ...messagesQueries,
        ...postsQueries,
    },
})

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        ...authMutations,
        ...usersMutations,
        ...messagesMutations,
        ...postsMutations,
    }
})

const Subscription = new GraphQLObjectType({
    name: 'Subscription',
    fields: {
        ...messagesSubscriptions,
        ...postsSubscriptions,
        ...usersSubscriptions,
    }
})

const schema = new GraphQLSchema({
    query: Query,
    mutation: Mutation,
    subscription: Subscription,
})

export default schema