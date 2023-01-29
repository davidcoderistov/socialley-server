import {
    ThunkObjMap,
    GraphQLFieldConfig,
    GraphQLList,
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLString,
    GraphQLInt,
} from 'graphql'
import FullMessage from '../models/FullMessage'
import Message from '../models/Message'
import { Context } from '../types'
import messagesRepository from '../../repositories/messagesRepository'


const LatestMessagesOutput = new GraphQLObjectType({
    name: 'LatestMessagesOutput',
    fields: () => ({
        total: { type: new GraphQLNonNull(GraphQLInt) },
        data: { type: new GraphQLList(FullMessage) },
    })
})

const LatestMessagesCountOutput = new GraphQLObjectType({
    name: 'LatestMessagesCountOutput',
    fields: () => ({
        count: { type: new GraphQLNonNull(GraphQLInt) }
    })
})

const LatestChatMessagesOutput = new GraphQLObjectType({
    name: 'LatestChatMessagesOutput',
    fields: () => ({
        total: { type: new GraphQLNonNull(GraphQLInt) },
        data: { type: new GraphQLList(Message) },
    })
})

const messagesQueries: ThunkObjMap<GraphQLFieldConfig<any, Context>> = {
    getLatestMessage: {
        type: FullMessage,
        args: { userId: { type: new GraphQLNonNull(GraphQLString) }},
        resolve: (_, { userId }, { userId: loggedInUserId }) => {
            return messagesRepository.getLatestMessage({ users: [loggedInUserId, userId] })
        }
    },
    getLatestMessages: {
        type: LatestMessagesOutput,
        args: { offset: { type: new GraphQLNonNull(GraphQLInt )}, limit: { type: new GraphQLNonNull(GraphQLInt) } },
        resolve: (_, { offset, limit }, { userId }) => {
            return messagesRepository.getLatestMessages({ userId, offset, limit })
        }
    },
    getLatestMessagesCount: {
        type: LatestMessagesCountOutput,
        resolve: (_, __, { userId }) => {
            return messagesRepository.getLatestMessagesCount({ userId })
        }
    },
    getLatestChatMessages: {
        type: LatestChatMessagesOutput,
        args: {
            userId: { type: new GraphQLNonNull(GraphQLString )},
            offset: { type: new GraphQLNonNull(GraphQLInt )},
            limit: { type: new GraphQLNonNull(GraphQLInt) }
        },
        resolve: (_, { userId: userIdArg, offset, limit }, { userId }) => {
            return messagesRepository.getLatestChatMessages({ users: [userId, userIdArg], offset, limit })
        }
    }
}

export default messagesQueries