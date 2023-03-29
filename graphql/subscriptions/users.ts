import {
    ThunkObjMap,
    GraphQLFieldConfig,
} from 'graphql'
import FollowNotification from '../models/FollowNotification'
import { FollowType } from '../../models/Follow'
import { pubsub } from '../../config/server'
import { WsContext } from '../../types'
import { withFilter } from 'graphql-subscriptions'
import userRepository from '../../repositories/userRepository'


export const USERS_SUBSCRIPTIONS = {
    USER_FOLLOWED: 'USER_FOLLOWED'
}

const usersSubscriptions: ThunkObjMap<GraphQLFieldConfig<any, WsContext>> = {
    userFollowed: {
        type: FollowNotification,
        resolve: async (follow: FollowType) => {
            const followableUser = await userRepository.getFollowableUser({
                followableUserId: follow.followingUserId,
                userId: follow.followedUserId,
            })
            return {
                _id: follow._id,
                followableUser,
                createdAt: follow.createdAt,
            }
        },
        subscribe: withFilter(
            () => pubsub.asyncIterator(USERS_SUBSCRIPTIONS.USER_FOLLOWED),
            (payload: FollowType, variables, { userId }: WsContext) => {
                return payload.followedUserId === userId
            }
        )
    },
}

export default usersSubscriptions