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
import { DateScalar } from '../scalars'
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

const messagesQueries: ThunkObjMap<GraphQLFieldConfig<any, Context>> = {
    getLatestMessages: {
        type: LatestMessagesOutput,
        args: { offset: { type: new GraphQLNonNull(GraphQLInt )}, limit: { type: new GraphQLNonNull(GraphQLInt) } },
        resolve: (_, { offset, limit }, { userId }) => {
            return messagesRepository.getLatestMessages({ userId, offset, limit })
        }
    }
}

export default messagesQueries