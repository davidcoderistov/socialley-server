import {
    ThunkObjMap,
    GraphQLFieldConfig,
    GraphQLList,
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLID,
    GraphQLString,
    GraphQLInt,
} from 'graphql'
import Message from '../models/Message'
import PublicUser from '../models/PublicUser'
import { DateScalar } from '../scalars'
import { Context } from '../types'
import messagesRepository from '../../repositories/messagesRepository'


const LatestMessage = new GraphQLObjectType({
    name: 'LatestMessage',
    fields: () => ({
        messageId: { type: new GraphQLNonNull(GraphQLID) },
        fromUser: { type: PublicUser },
        toUser: { type: PublicUser },
        message: { type: GraphQLString },
        photoURL: { type: GraphQLString },
        createdAt: { type: new GraphQLNonNull(DateScalar) },
    })
})

const LatestMessagesOutput = new GraphQLObjectType({
    name: 'LatestMessagesOutput',
    fields: () => ({
        total: { type: new GraphQLNonNull(GraphQLInt) },
        data: { type: new GraphQLList(LatestMessage) },
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
    getLatestMessages: {
        type: LatestMessagesOutput,
        args: { offset: { type: new GraphQLNonNull(GraphQLInt )}, limit: { type: new GraphQLNonNull(GraphQLInt) } },
        resolve: (_, { offset, limit }, { userId }) => {
            return messagesRepository.getLatestMessages({ userId, offset, limit })
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