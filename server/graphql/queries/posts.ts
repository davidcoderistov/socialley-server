import {
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLString,
    GraphQLInt,
    GraphQLList, ThunkObjMap, GraphQLFieldConfig,
} from 'graphql'
import { DateScalar } from '../scalars'
import PublicUser from '../models/PublicUser'
import { Context } from '../types'
import postsRepository from '../../repositories/postsRepository'


const CommentWithLike = new GraphQLObjectType({
    name: 'CommentWithLike',
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLString) },
        text: { type: new GraphQLNonNull(GraphQLString) },
        postId: { type: new GraphQLNonNull(GraphQLString) },
        user: { type: new GraphQLNonNull(PublicUser) },
        likesCount: { type: new GraphQLNonNull(GraphQLInt) },
        createdAt: { type: new GraphQLNonNull(DateScalar) },
    })
})

const CommentsForPostOutput = new GraphQLObjectType({
    name: 'CommentsForPostOutput',
    fields: () => ({
        data: { type: new GraphQLNonNull(new GraphQLList(CommentWithLike)) },
        total: { type: new GraphQLNonNull(GraphQLInt) },
    })
})

const postsQueries: ThunkObjMap<GraphQLFieldConfig<any, Context>> = {
    getCommentsForPost: {
        type: CommentsForPostOutput,
        args: {
            postId: { type: new GraphQLNonNull(GraphQLString) },
            offset: { type: new GraphQLNonNull(GraphQLInt) },
            limit: { type: new GraphQLNonNull(GraphQLInt) },
        },
        resolve: (_, args) => postsRepository.getCommentsForPost(args)
    }
}

export default postsQueries