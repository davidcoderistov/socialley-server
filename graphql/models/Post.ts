import {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLNonNull,
} from 'graphql'
import { DateScalar } from '../scalars'


const Post = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLID) },
        title: { type: GraphQLString },
        photoURL: { type: new GraphQLNonNull(GraphQLString) },
        createdAt: { type: new GraphQLNonNull(DateScalar) },
    })
})

export default Post