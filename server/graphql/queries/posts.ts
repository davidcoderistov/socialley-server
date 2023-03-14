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
import PostLikeNotification from '../models/PostLikeNotification'
import PostCommentNotification from '../models/PostCommentNotification'
import { Context } from '../../types'
import postsRepository from '../../repositories/postsRepository'
import followedUsersPostsLoader from '../../loaders/followedUsersPostsLoader'
import suggestedPostsLoader from '../../loaders/suggestedPostsLoader'
import postLikeNotificationsLoader from '../../loaders/postLikeNotificationsLoader'


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

const PostsForUserOutput = new GraphQLObjectType({
    name: 'PostsForUserOutput',
    fields: () => ({
        data: { type: new GraphQLNonNull(new GraphQLList(Post)) },
        total: { type: new GraphQLNonNull(GraphQLInt) },
    })
})

const LikedPostsForUserOutput = new GraphQLObjectType({
    name: 'LikedPostsForUserOutput',
    fields: () => ({
        data: { type: new GraphQLNonNull(new GraphQLList(Post)) },
        total: { type: new GraphQLNonNull(GraphQLInt) },
    })
})

const FavoritePostsForUserOutput = new GraphQLObjectType({
    name: 'FavoritePostsForUserOutput',
    fields: () => ({
        data: { type: new GraphQLNonNull(new GraphQLList(Post)) },
        total: { type: new GraphQLNonNull(GraphQLInt) },
    })
})

const SuggestedPostsOutput = new GraphQLObjectType({
    name: 'SuggestedPostsOutput',
    fields: () => ({
        data: { type: new GraphQLNonNull(new GraphQLList(Post)) },
        total: { type: new GraphQLNonNull(GraphQLInt) },
    })
})

const PostLikeNotificationsForUserOutput = new GraphQLObjectType({
    name: 'PostLikeNotificationsForUserOutput',
    fields: () => ({
        data: { type: new GraphQLNonNull(new GraphQLList(PostLikeNotification)) },
        total: { type: new GraphQLNonNull(GraphQLInt) },
    })
})

const PostCommentNotificationsForUserOutput = new GraphQLObjectType({
    name: 'PostCommentNotificationsForUserOutput',
    fields: () => ({
        data: { type: new GraphQLNonNull(new GraphQLList(PostCommentNotification)) },
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
            if (offset === 0) {
                followedUsersPostsLoader.clear(userId)
            }
            const followedUsersPosts = await followedUsersPostsLoader.load(userId)
            return {
                total: followedUsersPosts.length,
                data: followedUsersPosts.slice(offset, offset + limit).map(followedUserPost => ({
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
        type: PostsForUserOutput,
        args: {
            userId: { type: new GraphQLNonNull(GraphQLString) },
            offset: { type: new GraphQLNonNull(GraphQLInt) },
            limit: { type: new GraphQLNonNull(GraphQLInt) },
        },
        resolve: (_,{ userId, offset, limit }) => postsRepository.getPostsForUser({ userId, offset, limit })
    },
    getLikedPostsForUser: {
        type: LikedPostsForUserOutput,
        args: {
            offset: { type: new GraphQLNonNull(GraphQLInt) },
            limit: { type: new GraphQLNonNull(GraphQLInt) },
        },
        resolve: (_,{ offset, limit },{ userId }) => postsRepository.getLikedPostsForUser({ userId, offset, limit })
    },
    getFavoritePostsForUser: {
        type: FavoritePostsForUserOutput,
        args: {
            offset: { type: new GraphQLNonNull(GraphQLInt) },
            limit: { type: new GraphQLNonNull(GraphQLInt) },
        },
        resolve: (_,{ offset, limit },{ userId }) => postsRepository.getFavoritePostsForUser({ userId, offset, limit  })
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
    },
    getSuggestedPosts: {
        type: SuggestedPostsOutput,
        args: {
            offset: { type: new GraphQLNonNull(GraphQLInt) },
            limit: { type: new GraphQLNonNull(GraphQLInt) },
        },
        resolve: async (_, { offset, limit }, { userId }) => {
            if (offset === 0) {
                suggestedPostsLoader.clear(userId)
            }
            const suggestedPosts = await suggestedPostsLoader.load(userId)
            return {
                data: suggestedPosts.slice(offset, offset + limit),
                total: suggestedPosts.length,
            }
        }
    },
    getPostLikeNotificationsForUser: {
        type: PostLikeNotificationsForUserOutput,
        args: {
            offset: { type: new GraphQLNonNull(GraphQLInt) },
            limit: { type: new GraphQLNonNull(GraphQLInt) },
        },
        resolve: async (_, { offset, limit }, { userId }) => {
            if (offset === 0) {
                postLikeNotificationsLoader.clear(userId)
            }
            const postLikeNotifications = await postLikeNotificationsLoader.load(userId)
            return {
                data: postLikeNotifications.slice(offset, offset + limit),
                total: postLikeNotifications.length,
            }
        }
    },
    getPostCommentNotificationsForUser: {
        type: PostCommentNotificationsForUserOutput,
        args: {
            offset: { type: new GraphQLNonNull(GraphQLInt) },
            limit: { type: new GraphQLNonNull(GraphQLInt) },
        },
        resolve: async (_, { offset, limit }, { userId }) =>
            postsRepository.getPostCommentNotificationsForUser({ userId, offset, limit })
    }
}

export default postsQueries