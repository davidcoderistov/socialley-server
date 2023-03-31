import fs from 'fs'


const initStorage = () => {
    const storageDir = process.env.NODE_ENV !== 'production' ? 'storage' : 'dist/storage'

    if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true })
    }

    const postsDir = `${storageDir}/posts`
    if (!fs.existsSync(postsDir)) {
        fs.mkdirSync(postsDir, { recursive: true })
    }

    const messagesDir = `${storageDir}/messages`
    if (!fs.existsSync(messagesDir)) {
        fs.mkdirSync(messagesDir, { recursive: true })
    }

    const avatarsDir = `${storageDir}/avatars`
    if (!fs.existsSync(avatarsDir)) {
        fs.mkdirSync(avatarsDir, { recursive: true })
    }
}

export default initStorage