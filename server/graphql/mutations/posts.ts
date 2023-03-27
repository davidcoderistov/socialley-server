import {
    ThunkObjMap,
    GraphQLFieldConfig,
    GraphQLInputObjectType,
    GraphQLNonNull,
    GraphQLString,
} from 'graphql'
import { GraphQLUpload } from 'graphql-upload-ts'
import { Context } from '../../types'
import PostDetails from '../models/PostDetails'
import Comment from '../models/Comment'
import PostLike from '../models/PostLike'
import UserFavorite from '../models/UserFavorite'
import CommentLike from '../models/CommentLike'
import postsRepository from '../../repositories/postsRepository'
import { pubsub } from '../../config/server'
import { POSTS_SUBSCRIPTIONS } from '../subscriptions/posts'


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

const postsMutations: ThunkObjMap<GraphQLFieldConfig<any, Context>> = {
    createPost: {
        type: PostDetails,
        args: { post: { type: new GraphQLNonNull(CreatePostInput) }},
        resolve: async (_, { post }, { userId }) => {
            const createdPost = await postsRepository.createPost({...post, userId})
            return {
                ...createdPost,
                post: {
                    _id: createdPost._id,
                    title: createdPost.title,
                    photoURL: createdPost.photoURL,
                    createdAt: createdPost.createdAt,
                },
                followableUser: {
                    user: createdPost.user,
                    following: true,
                },
                firstLikeUser: null,
                liked: false,
                favorite: false,
                likesCount: 0,
            }
        }
    },
    createComment: {
        type: Comment,
        args: { comment: { type: CreateCommentInput }},
        resolve: async (_, { comment }, { userId }) => {
            const savedComment = await postsRepository.createComment({...comment, userId})
            pubsub.publish(POSTS_SUBSCRIPTIONS.POST_COMMENTED, savedComment)
            return savedComment
        }
    },
    likePost: {
        type: PostLike,
        args: { postId: { type: new GraphQLNonNull(GraphQLString) }},
        resolve: async (_, { postId }, { userId }) => {
            const postLike = await postsRepository.likePost({ postId, userId })
            pubsub.publish(POSTS_SUBSCRIPTIONS.POST_LIKED, postLike)
            return postLike
        }
    },
    unlikePost: {
        type: PostLike,
        args: { postId: { type: new GraphQLNonNull(GraphQLString) }},
        resolve: (_, { postId }, { userId }) => postsRepository.unlikePost({ postId, userId })
    },
    likeComment: {
        type: CommentLike,
        args: { commentId: { type: new GraphQLNonNull(GraphQLString) }},
        resolve: (_, { commentId }, { userId }) => postsRepository.likeComment({ commentId, userId })
    },
    unlikeComment: {
        type: CommentLike,
        args: { commentId: { type: new GraphQLNonNull(GraphQLString) }},
        resolve: (_, { commentId }, { userId }) => postsRepository.unlikeComment({ commentId, userId })
    },
    markUserPostAsFavorite: {
        type: UserFavorite,
        args: { postId: { type: new GraphQLNonNull(GraphQLString) }},
        resolve: (_, { postId }, { userId }) => postsRepository.markUserPostAsFavorite({ postId, userId })
    },
    unmarkUserPostAsFavorite: {
        type: UserFavorite,
        args: { postId: { type: new GraphQLNonNull(GraphQLString) }},
        resolve: (_, { postId }, { userId }) => postsRepository.unmarkUserPostAsFavorite({ postId, userId })
    }
}

export default postsMutations