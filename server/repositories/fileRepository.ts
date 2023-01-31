import { createWriteStream, unlink } from 'fs'
import path from 'path'
import { FileUpload } from 'graphql-upload-ts'


async function storeUpload (upload: Promise<FileUpload>, url: string) {
    const { createReadStream, filename } = await upload
    const stream = createReadStream()
    const storedFileName = `${new Date().getTime()}-${filename}`
    const storedFileDbUrl = path.join('/', url, storedFileName)
    const storedFileUrl = path.join(__dirname, '..', storedFileDbUrl)

    await new Promise((resolve, reject) => {
        const writeStream = createWriteStream(storedFileUrl)

        writeStream.on('finish', resolve)

        writeStream.on('error', (error) => {
            unlink(storedFileUrl, () => {
                reject(error)
            })
        })

        stream.on('error', (error) => writeStream.destroy(error))

        stream.pipe(writeStream)
    })

    return {
        name: storedFileName,
        url: storedFileDbUrl,
    }
}

export default {
    storeUpload
}