import {
    ThunkObjMap,
    GraphQLFieldConfig,
} from 'graphql'
import PostLikeNotification from '../models/PostLikeNotification'
import PostCommentNotification from '../models/PostCommentNotification'
import { pubsub } from '../../config/server'
import { WsContext } from '../../types'
import { withFilter } from 'graphql-subscriptions'


export const POSTS_SUBSCRIPTIONS = {
    POST_LIKED: 'POST_LIKED',
    POST_COMMENTED: 'POST_COMMENTED',
}

const postsSubscriptions: ThunkObjMap<GraphQLFieldConfig<any, WsContext>> = {
    postLiked: {
        type: PostLikeNotification,
        resolve: postLikeNotification => postLikeNotification,
        subscribe: withFilter(
            () => pubsub.asyncIterator(POSTS_SUBSCRIPTIONS.POST_LIKED),
            (payload: { post: { userId: string }}, variables, { userId }: WsContext) => {
                return payload.post.userId === userId
            }
        )
    },
    postCommented: {
        type: PostCommentNotification,
        resolve: postCommentNotification => postCommentNotification,
        subscribe: withFilter(
            () => pubsub.asyncIterator(POSTS_SUBSCRIPTIONS.POST_COMMENTED),
            (payload: { post: { userId: string }}, variables, { userId }: WsContext) => {
                return payload.post.userId === userId
            }
        )
    },
}

export default postsSubscriptions