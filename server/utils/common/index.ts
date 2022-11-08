import jwt from 'jsonwebtoken'


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

