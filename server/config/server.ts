import express from 'express'
import http from 'http'
import cors from 'cors'
import { json } from 'body-parser'
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/lib/use/ws'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { serializeRefreshToken, deserializeRefreshToken } from '../utils'
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
                }
            }
        }
    }))

    httpServer.listen(process.env.PORT, () => {
        console.log(`Server listening on http://localhost:${process.env.PORT}/api`)
    })
}

export default setupServer