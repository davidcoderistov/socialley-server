import {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLNonNull,
} from 'graphql'
import { DateScalar } from '../scalars'
import PublicUser from './PublicUser'


const Post = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLID) },
        title: { type: GraphQLString },
        photoURL: { type: new GraphQLNonNull(GraphQLString) },
        videoURL: { type: GraphQLString },
        user: { type: new GraphQLNonNull(PublicUser) },
        createdAt: { type: new GraphQLNonNull(DateScalar) },
    })
})

export default Post