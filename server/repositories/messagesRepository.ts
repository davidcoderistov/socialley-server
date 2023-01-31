import Message from '../models/Message'
import { FileUpload } from 'graphql-upload-ts'
import User, { UserType } from '../models/User'
import { Error, Document } from 'mongoose'
import { getValidationError, getCustomValidationError } from '../utils'
import fileRepository from './fileRepository'


interface CreateMessageInput {
    fromUserId: string
    toUserId: string
    message?: string
    photo?: Promise<FileUpload>
}

interface Message extends Document {
    fromUserId: UserType
    toUserId: UserType
}

async function createMessage ({ fromUserId, toUserId, message, photo }: CreateMessageInput) {
    try {
        if (!await User.findById(toUserId)) {
            return Promise.reject(getCustomValidationError('to', `User with id ${toUserId} does not exist`))
        }
        let photoURL = null
        if (photo) {
            const { url } = await fileRepository.storeUpload(photo, '/storage/messages')
            photoURL = url
        }
        const createdMessage = new Message({
            fromUserId,
            toUserId,
            message,
            photoURL,
        })
        await createdMessage.save()
        const populatedMessage = await Message.populate(createdMessage, 'fromUserId toUserId') as unknown as Message
        return {
            ...populatedMessage.toObject(),
            fromUser: populatedMessage.fromUserId,
            toUser: populatedMessage.toUserId
        }
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        } else {
            throw err
        }
    }
}

async function getLatestMessage ({ users }: { users: [string, string]}) {
    const aggregateData = await Message.aggregate([
        {
            $match: {
                $or: [
                    {
                        $and: [
                            { fromUserId: users[0] },
                            { toUserId: users[1] }
                        ]
                    },
                    {
                        $and: [
                            { fromUserId: users[1] },
                            { toUserId: users[0] }
                        ]
                    },
                ]
            },
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ])
    if (Array.isArray(aggregateData) && aggregateData.length > 0) {
        const message = await Message.populate(aggregateData[0], 'fromUserId toUserId') as unknown as {
            _id: string
            fromUserId: UserType,
            toUserId: UserType,
            message: string,
            photoURL: string,
            createdAt: string
        }
        return {
            _id: message._id,
            fromUser: message.fromUserId,
            toUser: message.toUserId,
            message: message.message,
            photoURL: message.photoURL,
            createdAt: message.createdAt
        }
    }
    return null
}

async function getLatestMessages ({ userId, offset, limit }: { userId: string, offset: number, limit: number }) {
    const aggregateData = await Message.aggregate([
        {
            $match: {
                $or: [
                    {
                        toUserId: userId,
                    },
                    {
                        fromUserId: userId,
                    }
                ]
            }
        },
        {
            $project: {
                fromUserId: 1,
                toUserId: 1,
                message: 1,
                photoURL: 1,
                createdAt: 1,
                fromToUser: [
                    '$fromUserId',
                    '$toUserId',
                ]
            }
        },
        {
            $unwind: '$fromToUser'
        },
        {
            $sort: {
                'fromToUser': 1
            }
        },
        {
            $group: {
                _id: '$_id',
                fromToUser: {
                    $push: '$fromToUser'
                },
                fromUserId: {
                    $first: '$fromUserId'
                },
                toUserId: {
                    $first: '$toUserId'
                },
                message: {
                    $first: '$message'
                },
                photoURL: {
                    $first: '$photoURL'
                },
                createdAt: {
                    $first: '$createdAt'
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $group: {
                _id: '$fromToUser',
                fromUserId: {
                    $first: '$fromUserId'
                },
                toUserId: {
                    $first: '$toUserId'
                },
                message: {
                    $first: '$message'
                },
                photoURL: {
                    $first: '$photoURL'
                },
                messageId: {
                    $first: '$_id'
                },
                createdAt: {
                    $first: '$createdAt'
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $facet: {
                metadata: [{
                    $count: 'count'
                }],
                data: [{
                    $skip: offset,
                }, {
                    $limit: limit,
                }]
            }
        }
    ])

    const messages = await Message.populate(aggregateData[0].data, 'fromUserId toUserId') as unknown as Array<{
        _id: string
        fromUserId: UserType,
        toUserId: UserType,
        message: string,
        photoURL: string,
        messageId: string
        createdAt: string
    }>

    return {
        total: aggregateData[0].metadata[0].count,
        data: messages.map(message => ({
            _id: message.messageId,
            fromUser: message.fromUserId,
            toUser: message.toUserId,
            message: message.message,
            photoURL: message.photoURL,
            createdAt: message.createdAt
        })),
    }
}

async function getLatestMessagesCount ({ userId }: { userId: string }) {
    const aggregateData = await Message.aggregate([
        {
            $match: {
                $or: [
                    {
                        toUserId: userId,
                    },
                    {
                        fromUserId: userId,
                    }
                ]
            }
        },
        {
            $project: {
                fromUserId: 1,
                toUserId: 1,
                message: 1,
                photoURL: 1,
                createdAt: 1,
                fromToUser: [
                    '$fromUserId',
                    '$toUserId',
                ]
            }
        },
        {
            $unwind: '$fromToUser'
        },
        {
            $sort: {
                'fromToUser': 1
            }
        },
        {
            $group: {
                _id: '$_id',
                fromToUser: {
                    $push: '$fromToUser'
                },
                fromUserId: {
                    $first: '$fromUserId'
                },
                toUserId: {
                    $first: '$toUserId'
                },
                message: {
                    $first: '$message'
                },
                photoURL: {
                    $first: '$photoURL'
                },
                createdAt: {
                    $first: '$createdAt'
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $group: {
                _id: '$fromToUser',
                fromUserId: {
                    $first: '$fromUserId'
                },
                toUserId: {
                    $first: '$toUserId'
                },
                message: {
                    $first: '$message'
                },
                photoURL: {
                    $first: '$photoURL'
                },
                messageId: {
                    $first: '$_id'
                },
                createdAt: {
                    $first: '$createdAt'
                }
            }
        },
        {
            $count: "count"
        }
    ])
    return { count: Array.isArray(aggregateData) && aggregateData.length > 0 ? aggregateData[0].count : 0 }
}

async function getLatestChatMessages ({ users, offset, limit }: { users: [string, string], offset: number, limit: number }) {
    const aggregateData = await Message.aggregate([
        {
            $match: {
                $or: [
                    {
                        $and: [
                            { fromUserId: users[0] },
                            { toUserId: users[1] }
                        ]
                    },
                    {
                        $and: [
                            { fromUserId: users[1] },
                            { toUserId: users[0] }
                        ]
                    },
                ]
            },
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $facet: {
                metadata: [{
                    $count: 'count'
                }],
                data: [{
                    $skip: offset,
                }, {
                    $limit: limit,
                }]
            }
        }
    ])

    return {
        total: aggregateData[0].metadata[0].count,
        data: aggregateData[0].data,
    }
}

export default {
    createMessage,
    getLatestMessage,
    getLatestMessages,
    getLatestMessagesCount,
    getLatestChatMessages,
}