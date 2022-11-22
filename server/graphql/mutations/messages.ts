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
        resolve: (_, { message }, { userId }) => {
            return messagesRepository.create({
                from: userId,
                to: message.to,
                message: message.message,
            })
        }
    }
}

export default messagesMutations