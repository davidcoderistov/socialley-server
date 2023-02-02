import {
    ThunkObjMap,
    GraphQLFieldConfig,
    GraphQLNonNull,
    GraphQLString,
} from 'graphql'
import { Context } from '../types'
import fileRepository from '../../repositories/fileRepository'


const filesQueries: ThunkObjMap<GraphQLFieldConfig<any, Context>> = {
    getImage: {
        type: GraphQLString,
        args: { url: { type: new GraphQLNonNull(GraphQLString) }},
        resolve: (_, { url }) => {
            return fileRepository.getEncodedFile(url)
        }
    }
}

export default filesQueries