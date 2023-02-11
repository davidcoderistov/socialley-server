import {
    ThunkObjMap,
    GraphQLFieldConfig,
    GraphQLInputObjectType,
    GraphQLNonNull,
    GraphQLString,
} from 'graphql'
import { GraphQLUpload } from 'graphql-upload-ts'
import { Context } from '../types'
import Post from '../models/Post'
import postsRepository from '../../repositories/postsRepository'


const CreatePostInput = new GraphQLInputObjectType({
    name: 'CreatePostInput',
    fields: () => ({
        title: { type: GraphQLString },
        photo: { type: new GraphQLNonNull(GraphQLUpload) },
        video: { type: GraphQLUpload },
    })
})

const postsMutations: ThunkObjMap<GraphQLFieldConfig<any, Context>> = {
    createPost: {
        type: Post,
        args: { post: { type: CreatePostInput }},
        resolve: (_, { post }, { userId }) => postsRepository.createPost({...post, userId})
    }
}

export default postsMutations