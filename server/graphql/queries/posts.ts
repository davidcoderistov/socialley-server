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

const FollowedUserPost = new GraphQLObjectType({
    name: 'FollowedUserPost',
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLString) },
        title: { type: GraphQLString },
        photoURL: { type: new GraphQLNonNull(GraphQLString) },
        videoURL: { type: GraphQLString },
        user: { type: new GraphQLNonNull(PublicUser) },
        firstLikeUser: { type: PublicUser },
        likesCount: { type: new GraphQLNonNull(GraphQLInt) },
        commentsCount: { type: new GraphQLNonNull(GraphQLInt) },
        createdAt: { type: new GraphQLNonNull(DateScalar) },
    })
})

const FollowedUsersPostsPaginated = new GraphQLObjectType({
    name: 'FollowedUsersPostsPaginated',
    fields: () => ({
        data: { type: new GraphQLNonNull(new GraphQLList(FollowedUserPost)) },
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
    },
    getFollowedUsersPostsPaginated: {
        type: FollowedUsersPostsPaginated,
        args: {
            offset: { type: new GraphQLNonNull(GraphQLInt) },
            limit: { type: new GraphQLNonNull(GraphQLInt) },
        },
        resolve: (_, { offset, limit }, { userId }) =>
            postsRepository.getFollowedUsersPostsPaginated({ userId, offset, limit })
    }
}

export default postsQueries