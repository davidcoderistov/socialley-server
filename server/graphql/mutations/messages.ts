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


const CreateMessageInput = new GraphQLInputObjectType({
    name: 'CreateMessageInput',
    fields: () => ({
        toUserId: { type: new GraphQLNonNull(GraphQLString) },
        message: { type: GraphQLString },
        photoURL: { type: GraphQLString },
    })
})

const messagesMutations: ThunkObjMap<GraphQLFieldConfig<any, Context>> = {
    createMessage: {
        type: Message,
        args: { message: { type: CreateMessageInput }},
        resolve: async (_, { message }, { userId }) => {
            const createdMessage = await messagesRepository.createMessage({
                fromUserId: userId,
                toUserId: message.toUserId,
                message: message.message,
                photoURL: message.photoURL,
            })
            pubsub.publish(MESSAGES_SUBSCRIPTIONS.MESSAGE_CREATED, createdMessage)
            return createdMessage
        }
    }
}

export default messagesMutations