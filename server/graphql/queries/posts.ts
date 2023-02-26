import {
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLString,
    GraphQLInt,
    GraphQLBoolean,
    GraphQLList,
    ThunkObjMap,
    GraphQLFieldConfig,
    GraphQLID,
} from 'graphql'
import { DateScalar } from '../scalars'
import FollowableUser from '../models/user/FollowableUser'
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
        liked: { type: new GraphQLNonNull(GraphQLBoolean) },
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

const LikingUser = new GraphQLObjectType({
    name: 'LikingUser',
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLID) },
        username: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        lastName: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        avatarURL: { type: GraphQLString },
        following: { type: new GraphQLNonNull(GraphQLBoolean) }
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

const UsersWhoLikedCommentOutput = new GraphQLObjectType({
    name: 'UsersWhoLikedCommentOutput',
    fields: () => ({
        data: { type: new GraphQLNonNull(new GraphQLList(LikingUser)) },
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
        resolve: (_, args, { userId }) => postsRepository.getUsersWhoLikedComment({ ...args,userId })
    },
    getFirstLikingUserForPost: {
        type: PublicUser,
        args: { postId: { type: new GraphQLNonNull(GraphQLString) }},
        resolve: (_, { postId }) => postsRepository.getFirstLikingUserForPost({ postId })
    }
}

export default postsQueries