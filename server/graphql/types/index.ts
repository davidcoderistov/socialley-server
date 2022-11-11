

export interface Context {
    setRefreshTokenCookie: (refreshToken: string, immediate?: boolean) => void
    getRefreshTokenCookie: () => string | undefined
}