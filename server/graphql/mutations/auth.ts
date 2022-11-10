import {
    ThunkObjMap,
    GraphQLFieldConfig,
    GraphQLInputObjectType,
    GraphQLNonNull,
    GraphQLString,
    GraphQLObjectType,
    GraphQLID,
} from 'graphql'
import userRepository from '../../repositories/userRepository'
import User from '../models/User'


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

const LoginOutput = new GraphQLObjectType({
    name: 'LoginOutput',
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLID) },
        username: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        lastName: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        accessToken: { type: new GraphQLNonNull(GraphQLString) },
    })
})

const authMutations:  ThunkObjMap<GraphQLFieldConfig<any, any, any>> = {
    signUp: {
        type: User,
        args: { user: { type: SignUpInput }},
        resolve: (_, { user }) => {
            return userRepository.signUp(user)
        }
    },
    login: {
        type: LoginOutput,
        args: { user: { type: LoginInput }},
        resolve: (_, { user }) => {
            return userRepository.login(user)
        }
    }
}

export default authMutations

