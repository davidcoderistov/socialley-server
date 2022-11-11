import {
    ThunkObjMap,
    GraphQLFieldConfig,
    GraphQLInputObjectType,
    GraphQLNonNull,
    GraphQLString,
} from 'graphql'
import userRepository from '../../repositories/userRepository'
import User from '../models/User'
import { Context } from '../types'


const SignUpInput = new GraphQLInputObjectType({
    name: 'SignUpInput',
    fields: () => ({
        username: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        lastName: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
    })
})

const LoginInput = new GraphQLInputObjectType({
    name: 'LoginInput',
    fields: () => ({
        username: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
    })
})

const authMutations:  ThunkObjMap<GraphQLFieldConfig<any, Context>> = {
    signUp: {
        type: User,
        args: { user: { type: SignUpInput }},
        resolve: (_, { user }) => {
            return userRepository.signUp(user)
        }
    },
    login: {
        type: User,
        args: { user: { type: LoginInput }},
        resolve: async (_, { user }, { setRefreshTokenCookie }) => {
            const loggedInUser = await userRepository.login(user)
            setRefreshTokenCookie(loggedInUser.refreshToken)
            return loggedInUser
        }
    },
    refresh: {
        type: User,
        resolve: async (_, __, { setRefreshTokenCookie, getRefreshTokenCookie }) => {
            const refreshToken = getRefreshTokenCookie()
            const user = await userRepository.refresh({ refreshToken })
            setRefreshTokenCookie(user.refreshToken)
            return user
        }
    },
    logout: {
        type: User,
        resolve: async (_, __, { setRefreshTokenCookie, getRefreshTokenCookie }) => {
            const refreshToken = getRefreshTokenCookie()
            const user = userRepository.logout({ refreshToken })
            setRefreshTokenCookie('', true)
            return user
        }
    }
}

export default authMutations

