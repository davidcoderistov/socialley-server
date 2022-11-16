import express from 'express'
import http from 'http'
import cors from 'cors'
import { json } from 'body-parser'
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/lib/use/ws'
import { ApolloServer, GraphQLRequestContextDidResolveOperation } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { serializeRefreshToken, deserializeRefreshToken, getUserIdFromAuthHeader, getInvalidSessionError } from '../utils'
import { Context } from '../graphql/types'
import schema from '../graphql/schema'


const setupServer = async () => {
    const app = express()
    const httpServer = http.createServer(app)

    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/api',
    })

    const serverCleanup = useServer({ schema }, wsServer)

    const server = new ApolloServer({
        schema,
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer }),
            {
                async serverWillStart () {
                    return {
                        async drainServer () {
                            await serverCleanup.dispose()
                        }
                    }
                },
                async requestDidStart () {
                    return {
                        async didResolveOperation (requestContext: GraphQLRequestContextDidResolveOperation<Context>) {
                            switch (requestContext.operationName) {
                                case 'signUp':
                                    return
                                case 'login':
                                    return
                                case 'refresh':
                                    return
                                case 'logout':
                                    return
                            }
                            if (!requestContext.contextValue.userId) {
                                throw getInvalidSessionError()
                            }
                        }
                    }
                }
            }
        ]
    })

    await server.start()

    app.use('/api', cors({ origin: 'http://localhost:3000', credentials: true }), json(), expressMiddleware(server, {
        context: async ({ req, res }) => {
            return {
                setRefreshTokenCookie (refreshToken: string, immediate: boolean = false) {
                    res.setHeader('Set-Cookie',serializeRefreshToken(refreshToken, immediate))
                },
                getRefreshTokenCookie () {
                    return deserializeRefreshToken(req.headers.cookie)
                },
                userId: await getUserIdFromAuthHeader(req.headers)
            }
        }
    }))

    httpServer.listen(process.env.PORT, () => {
        console.log(`Server listening on http://localhost:${process.env.PORT}/api`)
    })
}

export default setupServer