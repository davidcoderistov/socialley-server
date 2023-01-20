import {
    ThunkObjMap,
    GraphQLFieldConfig,
    GraphQLInputObjectType,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
} from 'graphql'
import { DateScalar } from '../scalars'
import messagesRepository from '../../repositories/messagesRepository'
import { Context } from '../types'
import { pubsub } from '../../config/server'
import { MESSAGES_SUBSCRIPTIONS } from '../subscriptions/messages'
import PublicUser from "../models/PublicUser";


const CreatedMessage = new GraphQLObjectType({
    name: 'CreatedMessage',
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLID) },
        fromUser: { type: new GraphQLNonNull(PublicUser) },
        toUser: { type: new GraphQLNonNull(PublicUser) },
        message: { type: GraphQLString },
        photoURL: { type: GraphQLString },
        createdAt: { type: new GraphQLNonNull(DateScalar) },
    })
})

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
        type: CreatedMessage,
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