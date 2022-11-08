import User from '../models/User'
import {
    ThunkObjMap,
    GraphQLFieldConfig,
    GraphQLList,
} from 'graphql'


const userQueries: ThunkObjMap<GraphQLFieldConfig<any, any, any>> = {
    users: {
        type: new GraphQLList(User),
        resolve () {
            return []
        }
    }
}

export default userQueries

