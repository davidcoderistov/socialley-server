import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull,
    GraphQLBoolean,
    GraphQLInt,
} from 'graphql'
import { DateScalar } from '../scalars'
import User from './User'


const Comment = new GraphQLObjectType({
    name: 'Comment',
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLString) },
        text: { type: new GraphQLNonNull(GraphQLString) },
        postId: { type: new GraphQLNonNull(GraphQLString) },
        user: { type: new GraphQLNonNull(User) },
        liked: { type: new GraphQLNonNull(GraphQLBoolean) },
        likesCount: { type: new GraphQLNonNull(GraphQLInt) },
        createdAt: { type: new GraphQLNonNull(DateScalar) },
    })
})

export default Comment