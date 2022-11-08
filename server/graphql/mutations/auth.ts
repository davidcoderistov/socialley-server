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

const SignUpOutput = new GraphQLObjectType({
    name: 'SignUpOutput',
    fields: () => ({
        _id: { type: GraphQLID },
        username: { type: GraphQLString },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
        accessToken: { type: GraphQLString },
    })
})

const authMutations:  ThunkObjMap<GraphQLFieldConfig<any, any, any>> = {
    signUp: {
        type: SignUpOutput,
        args: { user: { type: SignUpInput }},
        resolve: (_, { user }) => {
            return userRepository.signUp(user)
        }
    }
}

export default authMutations

