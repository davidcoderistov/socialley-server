import {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLNonNull,
} from 'graphql'
import { DateScalar } from '../scalars'


const UserSearch = new GraphQLObjectType({
    name: 'UserSearch',
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLID) },
        searchingUserId: { type: new GraphQLNonNull(GraphQLString) },
        searchedUserId: { type: new GraphQLNonNull(GraphQLString) },
        createdAt: { type: new GraphQLNonNull(DateScalar) },
    })
})

export default UserSearch