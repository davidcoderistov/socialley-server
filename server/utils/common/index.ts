import jwt from 'jsonwebtoken'
import cookie from 'cookie'


export function generateAccessToken (userId: string): string {
    return jwt.sign({
        id: userId,
        access: true,
    }, process.env.SECRET_KEY, { expiresIn: '15m' })
}

export function generateRefreshToken (userId: string): string {
    return jwt.sign({
        id: userId,
        refresh: true,
    }, process.env.SECRET_KEY, { expiresIn: '7d' })
}

export function verifyRefreshToken (refreshToken: string) {
    return new Promise((resolve, reject) => {
        jwt.verify(
            refreshToken,
            process.env.SECRET_KEY,
            (err, token) => {
                if (err) {
                    reject(err)
                }
                resolve(token)
            }
        )
    })
}

export function serializeRefreshToken (refreshToken: string) {
    return cookie.serialize('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
    })
}

export function deserializeRefreshToken (cookies: string): string | undefined {
    return cookie.parse(cookies)?.refreshToken
}

