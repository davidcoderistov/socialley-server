import {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLInt,
    GraphQLBoolean,
    GraphQLNonNull,
} from 'graphql'
import { DateScalar } from '../scalars'
import User from './User'


const Post = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLID) },
        title: { type: GraphQLString },
        photoURL: { type: new GraphQLNonNull(GraphQLString) },
        videoURL: { type: GraphQLString },
        user: { type: new GraphQLNonNull(User) },
        firstLikeUser: { type: User },
        liked: { type: new GraphQLNonNull(GraphQLBoolean) },
        favorite: { type: new GraphQLNonNull(GraphQLBoolean) },
        likesCount: { type: new GraphQLNonNull(GraphQLInt) },
        createdAt: { type: new GraphQLNonNull(DateScalar) },
    })
})

export default Post