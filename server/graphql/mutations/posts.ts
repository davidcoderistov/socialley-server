import {
    ThunkObjMap,
    GraphQLFieldConfig,
    GraphQLInputObjectType,
    GraphQLNonNull,
    GraphQLString,
} from 'graphql'
import { GraphQLUpload } from 'graphql-upload-ts'
import { Context } from '../types'
import Post from '../models/Post'
import Comment from '../models/Comment'
import PostLike from '../models/PostLike'
import postsRepository from '../../repositories/postsRepository'


const CreatePostInput = new GraphQLInputObjectType({
    name: 'CreatePostInput',
    fields: () => ({
        title: { type: GraphQLString },
        photo: { type: new GraphQLNonNull(GraphQLUpload) },
        video: { type: GraphQLUpload },
    })
})

const CreateCommentInput = new GraphQLInputObjectType({
    name: 'CreateCommentInput',
    fields: () => ({
        text: { type: new GraphQLNonNull(GraphQLString) },
        postId: { type: new GraphQLNonNull(GraphQLString) },
    })
})

const LikePostInput = new GraphQLInputObjectType({
    name: 'LikePostInput',
    fields: () => ({
        postId: { type: new GraphQLNonNull(GraphQLString) },
    })
})

const postsMutations: ThunkObjMap<GraphQLFieldConfig<any, Context>> = {
    createPost: {
        type: Post,
        args: { post: { type: CreatePostInput }},
        resolve: (_, { post }, { userId }) => postsRepository.createPost({...post, userId})
    },
    createComment: {
        type: Comment,
        args: { comment: { type: CreateCommentInput }},
        resolve: (_, { comment }, { userId }) => postsRepository.createComment({...comment, userId})
    },
    likePost: {
        type: PostLike,
        args: { postLike: { type: LikePostInput }},
        resolve: (_, { postLike }, { userId }) => postsRepository.likePost({...postLike, userId})
    }
}

export default postsMutations