

export interface Context {
    setRefreshTokenCookie: (refreshToken: string) => void
    getRefreshTokenCookie: () => string | undefined
}