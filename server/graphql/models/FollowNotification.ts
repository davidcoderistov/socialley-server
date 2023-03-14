import {
    GraphQLObjectType,
    GraphQLID,
    GraphQLNonNull,
} from 'graphql'
import { DateScalar } from '../scalars'
import FollowableUser from './FollowableUser'


const FollowNotification = new GraphQLObjectType({
    name: 'FollowNotification',
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLID) },
        followableUser: { type: new GraphQLNonNull(FollowableUser) },
        createdAt: { type: new GraphQLNonNull(DateScalar) },
    })
})

export default FollowNotification