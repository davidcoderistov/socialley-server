import mongoose from 'mongoose'

export interface Context {
    setRefreshTokenCookie: (refreshToken: string, immediate?: boolean) => void
    getRefreshTokenCookie: () => string | undefined
    userId: string | null
}

export interface WsContext {
    userId: string
}

export interface PublicUser {
    _id: mongoose.Types.ObjectId
    firstName: string
    lastName: string
    username: string
    email: string
    avatarURL: string | null
}