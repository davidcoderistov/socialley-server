import {
    ThunkObjMap,
    GraphQLFieldConfig,
    GraphQLInputObjectType,
    GraphQLNonNull,
    GraphQLString,
} from 'graphql'
import userRepository from '../../repositories/userRepository'
import User from '../models/user/User'
import AuthUser from '../models/user/AuthUser'
import { Context } from '../types'


const SignUpOptions = new GraphQLInputObjectType({
    name: 'SignUpOptions',
    fields: () => ({
        username: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        lastName: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
    })
})

const LoginOptions = new GraphQLInputObjectType({
    name: 'LoginOptions',
    fields: () => ({
        username: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
    })
})

const authMutations:  ThunkObjMap<GraphQLFieldConfig<any, Context>> = {
    signUp: {
        type: User,
        args: { user: { type: SignUpOptions }},
        resolve: (_, { user }) => {
            return userRepository.signUp(user)
        }
    },
    login: {
        type: AuthUser,
        args: { user: { type: LoginOptions }},
        resolve: async (_, { user }, { setRefreshTokenCookie }) => {
            const loggedInUser = await userRepository.login(user)
            setRefreshTokenCookie(loggedInUser.refreshToken)
            return {
                user: loggedInUser,
                accessToken: loggedInUser.accessToken
            }
        }
    },
    refresh: {
        type: AuthUser,
        resolve: async (_, __, { setRefreshTokenCookie, getRefreshTokenCookie }) => {
            const refreshToken = getRefreshTokenCookie()
            const user = await userRepository.refresh({ refreshToken })
            setRefreshTokenCookie(user.refreshToken)
            return {
                user,
                accessToken: user.accessToken
            }
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

