import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull,
} from 'graphql'
import User from './User'


const AuthUser = new GraphQLObjectType({
    name: 'AuthUser',
    fields: () => ({
        user: { type: new GraphQLNonNull(User) },
        accessToken: { type: GraphQLString },
    })
})

export default AuthUser