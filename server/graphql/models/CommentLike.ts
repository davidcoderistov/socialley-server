import {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLNonNull,
} from 'graphql'
import { DateScalar } from '../scalars'


const CommentLike = new GraphQLObjectType({
    name: 'CommentLike',
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLID) },
        commentId: { type: new GraphQLNonNull(GraphQLString) },
        userId: { type: new GraphQLNonNull(GraphQLString) },
        createdAt: { type: new GraphQLNonNull(DateScalar) },
    })
})

export default CommentLike