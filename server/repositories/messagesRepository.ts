import Message, { MessageType } from '../models/Message'
import User, { UserType } from '../models/User'
import { Error } from 'mongoose'
import { getValidationError, getCustomValidationError } from '../utils'


interface CreateMessageInput {
    fromUserId: string
    toUserId: string
    message?: string
    photoURL?: string
}

async function createMessage ({ fromUserId, toUserId, message, photoURL }: CreateMessageInput): Promise<MessageType> {
    try {
        if (!await User.findById(toUserId)) {
            return Promise.reject(getCustomValidationError('to', `User with id ${toUserId} does not exist`))
        }
        const createdMessage = new Message({
            fromUserId,
            toUserId,
            message,
            photoURL,
        })
        return await createdMessage.save()
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            throw getValidationError(err)
        } else {
            throw err
        }
    }
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
            ...message,
            fromUser: message.fromUserId,
            toUser: message.toUserId,
        })),
    }
}

export default {
    createMessage,
    getLatestMessages,
}