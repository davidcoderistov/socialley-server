import {
    GraphQLObjectType,
    GraphQLInt,
    GraphQLBoolean,
    GraphQLNonNull,
} from 'graphql'
import Post from './Post'
import User from './User'
import FollowableUser from './FollowableUser'


const PostDetails = new GraphQLObjectType({
    name: 'PostDetails',
    fields: () => ({
        post: { type: new GraphQLNonNull(Post) },
        followableUser: { type: new GraphQLNonNull(FollowableUser) },
        firstLikeUser: { type: User },
        liked: { type: new GraphQLNonNull(GraphQLBoolean) },
        favorite: { type: new GraphQLNonNull(GraphQLBoolean) },
        likesCount: { type: new GraphQLNonNull(GraphQLInt) },
    })
})

export default PostDetails