import {
    GraphQLObjectType,
    GraphQLID,
    GraphQLNonNull,
} from 'graphql'
import { DateScalar } from '../scalars'
import User from './User'
import Post from './Post'


const PostCommentNotification = new GraphQLObjectType({
    name: 'PostCommentNotification',
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLID) },
        user: { type: new GraphQLNonNull(User) },
        post: { type: new GraphQLNonNull(Post) },
        createdAt: { type: new GraphQLNonNull(DateScalar) },
    })
})

export default PostCommentNotification