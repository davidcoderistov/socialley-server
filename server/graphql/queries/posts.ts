import {
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLString,
    GraphQLInt,
    GraphQLBoolean,
    GraphQLList,
    ThunkObjMap,
    GraphQLFieldConfig,
} from 'graphql'
import { DateScalar } from '../scalars'
import User from '../models/user/User'
import FollowableUser from '../models/user/FollowableUser'
import PublicUser from '../models/PublicUser'
import Comment from '../models/Comment'
import { Context } from '../types'
import postsRepository from '../../repositories/postsRepository'


const CommentsForPostOutput = new GraphQLObjectType({
    name: 'CommentsForPostOutput',
    fields: () => ({
        data: { type: new GraphQLNonNull(new GraphQLList(Comment)) },
        total: { type: new GraphQLNonNull(GraphQLInt) },
    })
})

const FollowedUser = new GraphQLObjectType({
    name: 'FollowedUser',
    fields: () => ({...PublicUser.toConfig().fields})
})

const FollowedUserPost = new GraphQLObjectType({
    name: 'FollowedUserPost',
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLString) },
        title: { type: GraphQLString },
        photoURL: { type: new GraphQLNonNull(GraphQLString) },
        videoURL: { type: GraphQLString },
        user: { type: new GraphQLNonNull(FollowedUser) },
        firstLikeUser: { type: PublicUser },
        liked: { type: new GraphQLNonNull(GraphQLBoolean) },
        favorite: { type: new GraphQLNonNull(GraphQLBoolean) },
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

const UserWhoLikedPost = new GraphQLObjectType({
    name: 'UserWhoLikedPost',
    fields: () => ({
        followableUser: { type: new GraphQLNonNull(FollowableUser) }
    })
})

const UsersWhoLikedPostOutput = new GraphQLObjectType({
    name: 'UsersWhoLikedPostOutput',
    fields: () => ({
        data: { type: new GraphQLNonNull(new GraphQLList(UserWhoLikedPost)) },
        total: { type: new GraphQLNonNull(GraphQLInt) },
    })
})

const UserWhoLikedComment = new GraphQLObjectType({
    name: 'UserWhoLikedComment',
    fields: () => ({
        followableUser: { type: new GraphQLNonNull(FollowableUser) }
    })
})

const UsersWhoLikedCommentOutput = new GraphQLObjectType({
    name: 'UsersWhoLikedCommentOutput',
    fields: () => ({
        data: { type: new GraphQLNonNull(new GraphQLList(UserWhoLikedComment)) },
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
        resolve: (_, args, { userId }) => postsRepository.getCommentsForPost({ ...args, userId })
    },
    getFollowedUsersPostsPaginated: {
        type: FollowedUsersPostsPaginated,
        args: {
            offset: { type: new GraphQLNonNull(GraphQLInt) },
            limit: { type: new GraphQLNonNull(GraphQLInt) },
        },
        resolve: (_, { offset, limit }, { userId }) =>
            postsRepository.getFollowedUsersPostsPaginated({ userId, offset, limit })
    },
    getUsersWhoLikedPost: {
        type: UsersWhoLikedPostOutput,
        args: {
            postId: { type: new GraphQLNonNull(GraphQLString) },
            offset: { type: new GraphQLNonNull(GraphQLInt) },
            limit: { type: new GraphQLNonNull(GraphQLInt) },
        },
        resolve: async (_, args, { userId }) => {
            const usersWhoLikedPost = await postsRepository.getUsersWhoLikedPost({ ...args,userId })
            return {
                ...usersWhoLikedPost,
                data: usersWhoLikedPost.data.map(userWhoLikedPost => ({
                    followableUser: {
                        user: userWhoLikedPost,
                        following: userWhoLikedPost.following
                    }
                }))
            }
        }
    },
    getUsersWhoLikedComment: {
        type: UsersWhoLikedCommentOutput,
        args: {
            commentId: { type: new GraphQLNonNull(GraphQLString) },
            offset: { type: new GraphQLNonNull(GraphQLInt) },
            limit: { type: new GraphQLNonNull(GraphQLInt) },
        },
        resolve: async (_, args, { userId }) => {
            const usersWhoLikedComment = await postsRepository.getUsersWhoLikedComment({ ...args,userId })
            return {
                ...usersWhoLikedComment,
                data: usersWhoLikedComment.data.map(userWhoLikedComment => ({
                    followableUser: {
                        user: userWhoLikedComment,
                        following: userWhoLikedComment.following
                    }
                }))
            }
        }
    },
    getFirstUserWhoLikedPost: {
        type: User,
        args: { postId: { type: new GraphQLNonNull(GraphQLString) }},
        resolve: (_, { postId }) => postsRepository.getFirstLikingUserForPost({ postId })
    }
}

export default postsQueries