import {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLNonNull,
} from 'graphql'
import { DateScalar } from '../scalars'


const Follow = new GraphQLObjectType({
    name: 'Follow',
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLID) },
        followingUserId: { type: new GraphQLNonNull(GraphQLString) },
        followedUserId: { type: new GraphQLNonNull(GraphQLString) },
        createdAt: { type: new GraphQLNonNull(DateScalar) },
    })
})

export default Follow