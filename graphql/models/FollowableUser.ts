import {
    GraphQLObjectType,
    GraphQLBoolean,
    GraphQLNonNull,
} from 'graphql'
import User from './User'


const FollowableUser = new GraphQLObjectType({
    name: 'FollowableUser',
    fields: () => ({
        user: { type: new GraphQLNonNull(User) },
        following: { type: new GraphQLNonNull(GraphQLBoolean) },
    })
})

export default FollowableUser