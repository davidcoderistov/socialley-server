import {
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLString,
    GraphQLInt,
    GraphQLList,
    ThunkObjMap,
    GraphQLFieldConfig,
} from 'graphql'
import User from '../models/User'
import FollowableUser from '../models/FollowableUser'
import Comment from '../models/Comment'
import Post from '../models/Post'
import PostDetails from '../models/PostDetails'
import { Context } from '../../types'
import postsRepository from '../../repositories/postsRepository'


const CommentsForPostOutput = new GraphQLObjectType({
    name: 'CommentsForPostOutput',
    fields: () => ({
        data: { type: new GraphQLNonNull(new GraphQLList(Comment)) },
        total: { type: new GraphQLNonNull(GraphQLInt) },
    })
})

const FollowedUserPost = new GraphQLObjectType({
    name: 'FollowedUserPost',
    fields: () => ({
        postDetails: { type: new GraphQLNonNull(PostDetails) },
        commentsCount: { type: new GraphQLNonNull(GraphQLInt) },
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
    getFollowedUsersPosts: {
        type: FollowedUsersPostsPaginated,
        args: {
            offset: { type: new GraphQLNonNull(GraphQLInt) },
            limit: { type: new GraphQLNonNull(GraphQLInt) },
        },
        resolve: async (_, { offset, limit }, { userId }) => {
            const followedUsersPosts = await postsRepository.getFollowedUsersPosts({ userId, offset, limit })
            return {
                ...followedUsersPosts,
                data: followedUsersPosts.data.map(followedUserPost => ({
                    postDetails: {
                        post: {
                            _id: followedUserPost._id,
                            title: followedUserPost.title,
                            photoURL: followedUserPost.photoURL,
                            videoURL: followedUserPost.videoURL,
                            createdAt: followedUserPost.createdAt,
                        },
                        user: followedUserPost.user,
                        firstLikeUser: followedUserPost.firstLikeUser,
                        liked: followedUserPost.liked,
                        favorite: followedUserPost.favorite,
                        likesCount: followedUserPost.likesCount,
                    },
                    commentsCount: followedUserPost.commentsCount,
                }))
            }
        }
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
    },
    getPostsForUser: {
        type: new GraphQLNonNull(new GraphQLList(Post) ),
        resolve: (_,__,{ userId }) => postsRepository.getPostsForUser({ userId })
    },
    getLikedPostsForUser: {
        type: new GraphQLNonNull(new GraphQLList(Post) ),
        resolve: (_,__,{ userId }) => postsRepository.getLikedPostsForUser({ userId })
    },
    getFavoritePostsForUser: {
        type: new GraphQLNonNull(new GraphQLList(Post) ),
        resolve: (_,__,{ userId }) => postsRepository.getFavoritePostsForUser({ userId })
    },
    getPostDetails: {
        type: new GraphQLNonNull(PostDetails),
        args: { postId: { type: new GraphQLNonNull(GraphQLString) }},
        resolve: async (_, {postId}, {userId}) => {
            const postDetails = await postsRepository.getPostDetails({ postId, userId })
            return {
                post: {
                    _id: postDetails._id,
                    title: postDetails.title,
                    photoURL: postDetails.photoURL,
                    videoURL: postDetails.videoURL,
                    createdAt: postDetails.createdAt,
                },
                user: postDetails.user,
                firstLikeUser: postDetails.firstLikeUser,
                liked: postDetails.liked,
                favorite: postDetails.favorite,
                likesCount: postDetails.likesCount,
            }
        }
    }
}

export default postsQueries