import {
    ThunkObjMap,
    GraphQLFieldConfig,
} from 'graphql'
import Message from '../models/Message'
import { MessageType } from '../../models/Message'
import { pubsub } from '../../config/server'
import { WsContext } from '../types'
import { withFilter } from 'graphql-subscriptions'


export const MESSAGES_SUBSCRIPTIONS = {
    MESSAGE_CREATED: 'MESSAGE_CREATED',
}

const messagesSubscriptions: ThunkObjMap<GraphQLFieldConfig<any, WsContext>> = {
    messageCreated: {
        type: Message,
        resolve: message => message,
        subscribe: withFilter(
            () => pubsub.asyncIterator([MESSAGES_SUBSCRIPTIONS.MESSAGE_CREATED]),
            (payload: MessageType, variables, { userId }: WsContext) => {
                return payload.to === userId
            }
        )
    }
}

export default messagesSubscriptions