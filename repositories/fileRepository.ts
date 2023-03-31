import { createWriteStream, unlink } from 'fs'
import path from 'path'
import { FileUpload } from 'graphql-upload-ts'
import sharp from 'sharp'
import { v2 as cloudinary } from 'cloudinary'


async function storeUpload (upload: Promise<FileUpload>, url: string, width: number, height: number): Promise<string> {
    const { createReadStream, filename } = await upload
    const stream = createReadStream()
    const storedFileUrl = path.join(__dirname, '..', path.join('/', url, `${new Date().getTime()}-${filename}`))

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

    return await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(storedFileUrl, {folder: url})
            .then(result => {
                unlink(storedFileUrl, () => {
                    resolve(result.secure_url)
                })
            })
            .catch(error => {
                reject(error)
            })
    })
}

export default {
    storeUpload
}