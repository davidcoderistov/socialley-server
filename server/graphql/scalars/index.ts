import { GraphQLScalarType } from 'graphql'


export const DateScalar = new GraphQLScalarType({
    name: 'DateScalar',
    serialize (value: Date) {
        return value.getTime()
    },
    parseValue (value: number) {
        return new Date(value)
    },
})