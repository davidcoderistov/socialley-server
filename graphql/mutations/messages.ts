import {
    ThunkObjMap,
    GraphQLFieldConfig,
    GraphQLInputObjectType,
    GraphQLNonNull,
    GraphQLString,
} from 'graphql'
import { GraphQLUpload } from 'graphql-upload-ts'
import FullMessage from '../models/FullMessage'
import messagesRepository from '../../repositories/messagesRepository'
import { Context } from '../../types'
import { pubsub } from '../../config/server'
import { MESSAGES_SUBSCRIPTIONS } from '../subscriptions/messages'


const CreateMessageInput = new GraphQLInputObjectType({
    name: 'CreateMessageInput',
    fields: () => ({
        toUserId: { type: new GraphQLNonNull(GraphQLString) },
        message: { type: GraphQLString },
        photo: { type: GraphQLUpload },
    })
})

const messagesMutations: ThunkObjMap<GraphQLFieldConfig<any, Context>> = {
    createMessage: {
        type: FullMessage,
        args: { message: { type: CreateMessageInput }},
        resolve: async (_, { message }, { userId }) => {
            const createdMessage = await messagesRepository.createMessage({
                fromUserId: userId,
                toUserId: message.toUserId,
                message: message.message,
                photo: message.photo,
            })
            pubsub.publish(MESSAGES_SUBSCRIPTIONS.MESSAGE_CREATED, createdMessage)
            return createdMessage
        }
    }
}

export default messagesMutations