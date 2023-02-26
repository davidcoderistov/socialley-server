import {
    ThunkObjMap,
    GraphQLFieldConfig,
} from 'graphql'
import FullMessage from '../models/FullMessage'
import { pubsub } from '../../config/server'
import { WsContext } from '../../types'
import { withFilter } from 'graphql-subscriptions'
import { Types } from 'mongoose'


export const MESSAGES_SUBSCRIPTIONS = {
    MESSAGE_CREATED: 'MESSAGE_CREATED',
}

const messagesSubscriptions: ThunkObjMap<GraphQLFieldConfig<any, WsContext>> = {
    messageCreated: {
        type: FullMessage,
        resolve: message => message,
        subscribe: withFilter(
            () => pubsub.asyncIterator(MESSAGES_SUBSCRIPTIONS.MESSAGE_CREATED),
            (payload: { toUser: { _id: Types.ObjectId }}, variables, { userId }: WsContext) => {
                return payload.toUser._id.toString() === userId
            }
        )
    }
}

export default messagesSubscriptions