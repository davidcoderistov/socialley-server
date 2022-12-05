import Message from '../models/Message'
import {
    ThunkObjMap,
    GraphQLFieldConfig,
    GraphQLList,
} from 'graphql'
import { Context } from '../types'
import messagesRepository from '../../repositories/messagesRepository'


const messagesQueries: ThunkObjMap<GraphQLFieldConfig<any, Context>> = {
    getLatestMessages: {
        type: new GraphQLList(Message),
        resolve: async (_, __, { userId }) => {
            const latest = await messagesRepository.getLatestMessages({ userId })
            return latest.map(message => ({
                ...message,
                _id: message.messageId,
            }))
        }
    }
}

export default messagesQueries