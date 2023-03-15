import {
    ThunkObjMap,
    GraphQLFieldConfig,
    GraphQLInputObjectType,
    GraphQLNonNull,
    GraphQLString,
} from 'graphql'
import { GraphQLUpload } from 'graphql-upload-ts'
import userRepository from '../../repositories/userRepository'
import User from '../models/User'
import AuthUser from '../models/AuthUser'
import { Context } from '../../types'


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

const EditUserOptions = new GraphQLInputObjectType({
    name: 'EditUserOptions',
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        lastName: { type: new GraphQLNonNull(GraphQLString) },
        username: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
    })
})

const ChangePasswordOptions = new GraphQLInputObjectType({
    name: 'ChangePasswordOptions',
    fields: () => ({
        username: { type: new GraphQLNonNull(GraphQLString) },
        oldPassword: { type: new GraphQLNonNull(GraphQLString) },
        newPassword: { type: new GraphQLNonNull(GraphQLString) },
        confirmNewPassword: { type: new GraphQLNonNull(GraphQLString) },
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
    },
    editUser: {
        type: AuthUser,
        args: { user: { type: EditUserOptions }},
        resolve: async (_, { user }, { setRefreshTokenCookie }) => {
            const loggedInUser = await userRepository.editUser(user)
            setRefreshTokenCookie(loggedInUser.refreshToken)
            return {
                user: loggedInUser,
                accessToken: loggedInUser.accessToken
            }
        }
    },
    changePassword: {
        type: AuthUser,
        args: { changePassword: { type: ChangePasswordOptions }},
        resolve: async (_, { changePassword }, { setRefreshTokenCookie }) => {
            const loggedInUser = await userRepository.changePassword(changePassword)
            setRefreshTokenCookie(loggedInUser.refreshToken)
            return {
                user: loggedInUser,
                accessToken: loggedInUser.accessToken
            }
        }
    },
    changeProfilePhoto: {
        type: AuthUser,
        args: { photo: { type: new GraphQLNonNull(GraphQLUpload) }},
        resolve: async (_, { photo }, { userId: _id, setRefreshTokenCookie }) => {
            const user = await userRepository.changeProfilePhoto({ _id, photo })
            setRefreshTokenCookie(user.refreshToken)
            return {
                user,
                accessToken: user.accessToken,
            }
        }
    }
}

export default authMutations

