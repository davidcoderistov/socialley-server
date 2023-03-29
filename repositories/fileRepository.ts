import { createWriteStream, unlink } from 'fs'
import path from 'path'
import fs from 'fs'
import { FileUpload } from 'graphql-upload-ts'
import sharp from 'sharp'


async function storeUpload (upload: Promise<FileUpload>, url: string, width: number, height: number) {
    const { createReadStream, filename } = await upload
    const stream = createReadStream()
    const storedFileName = `${new Date().getTime()}-${filename}`
    const storedFileDbUrl = path.join('/', url, storedFileName)
    const storedFileUrl = path.join(__dirname, '..', storedFileDbUrl)

    const chunks: Buffer[] = []

    // Push each chunk of data into the 'chunks' array
    for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk))
    }

    // Concatenate the chunks into a single buffer
    const fileBuffer = Buffer.concat(chunks)

    // Resize the image using Sharp
    const resizedImageBuffer = await sharp(fileBuffer)
        .resize(width, height)
        .toBuffer()

    await new Promise((resolve, reject) => {
        const writeStream = createWriteStream(storedFileUrl)

        writeStream.on('finish', resolve)

        writeStream.on('error', (error) => {
            unlink(storedFileUrl, () => {
                reject(error)
            })
        })

        writeStream.write(resizedImageBuffer)
        writeStream.end()
    })

    return {
        name: storedFileName,
        url: storedFileDbUrl,
    }
}

async function getEncodedFile (url: string) {
    const filePath = path.join(__dirname, '..', url)
    const fileData = fs.readFileSync(filePath)
    return Buffer.from(fileData).toString('base64')
}

export default {
    storeUpload,
    getEncodedFile,
}