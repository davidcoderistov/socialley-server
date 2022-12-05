import {
    ThunkObjMap,
    GraphQLFieldConfig,
    GraphQLList,
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLID,
    GraphQLString,
} from 'graphql'
import { Context } from '../types'
import messagesRepository from '../../repositories/messagesRepository'


const LatestMessageUser = new GraphQLObjectType({
    name: 'LatestMessageUser',
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLID) },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
    })
})

const LatestMessage = new GraphQLObjectType({
    name: 'LatestMessage',
    fields: () => ({
        messageId: { type: new GraphQLNonNull(GraphQLID) },
        fromUser: { type: LatestMessageUser },
        toUser: { type: LatestMessageUser },
        message: { type: GraphQLString },
        photoURL: { type: GraphQLString },
        createdAt: { type: new GraphQLNonNull(GraphQLString) },
    })
})

const messagesQueries: ThunkObjMap<GraphQLFieldConfig<any, Context>> = {
    getLatestMessages: {
        type: new GraphQLList(LatestMessage),
        resolve: async (_, __, { userId }) => {
            const latest = await messagesRepository.getLatestMessages({ userId })
            return latest.map(message => ({
                ...message,
                fromUser: typeof message.fromUserId === 'string' ? { _id: message.fromUserId } : message.fromUserId,
                toUser: typeof message.toUserId === 'string' ? { _id: message.toUserId } : message.toUserId,
            }))
        }
    }
}

export default messagesQueries