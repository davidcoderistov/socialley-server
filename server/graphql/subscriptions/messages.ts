import {
    ThunkObjMap,
    GraphQLFieldConfig,
} from 'graphql'
import FullMessage from '../models/FullMessage'
import { pubsub } from '../../config/server'
import { WsContext } from '../types'
import { withFilter } from 'graphql-subscriptions'


export const MESSAGES_SUBSCRIPTIONS = {
    MESSAGE_CREATED: 'MESSAGE_CREATED',
}

const messagesSubscriptions: ThunkObjMap<GraphQLFieldConfig<any, WsContext>> = {
    messageCreated: {
        type: FullMessage,
        resolve: message => message,
        subscribe: withFilter(
            () => pubsub.asyncIterator([MESSAGES_SUBSCRIPTIONS.MESSAGE_CREATED]),
            (payload: { toUser: { _id: string }}, variables, { userId }: WsContext) => {
                return payload.toUser._id === userId
            }
        )
    }
}

export default messagesSubscriptions