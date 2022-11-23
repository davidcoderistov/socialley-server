import {
    ThunkObjMap,
    GraphQLFieldConfig,
    GraphQLInputObjectType,
    GraphQLNonNull,
    GraphQLString,
} from 'graphql'
import Message from '../models/Message'
import messagesRepository from '../../repositories/messagesRepository'
import { Context } from '../types'
import { pubsub } from '../../config/server'
import { MESSAGES_SUBSCRIPTIONS } from '../subscriptions/messages'


const CreateInput = new GraphQLInputObjectType({
    name: 'CreateMessageInput',
    fields: () => ({
        to: { type: new GraphQLNonNull(GraphQLString) },
        message: { type: new GraphQLNonNull(GraphQLString) },
    })
})

const messagesMutations: ThunkObjMap<GraphQLFieldConfig<any, Context>> = {
    createMessage: {
        type: Message,
        args: { message: { type: CreateInput }},
        resolve: async (_, { message }, { userId }) => {
            const createdMessage = await messagesRepository.createMessage({
                from: userId,
                to: message.to,
                message: message.message,
            })
            pubsub.publish(MESSAGES_SUBSCRIPTIONS.MESSAGE_CREATED, createdMessage)
            return createdMessage
        }
    }
}

export default messagesMutations