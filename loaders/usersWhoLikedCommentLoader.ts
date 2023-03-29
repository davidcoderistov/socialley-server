import DataLoader from 'dataloader'
import postsRepository from '../repositories/postsRepository'


interface LoaderKey {
    userId: string
    commentId: string
}

const generateKey = (loaderKey: LoaderKey) => `${loaderKey.userId}-${loaderKey.commentId}`

const usersWhoLikedCommentLoader = new DataLoader(async (keys: LoaderKey[]) => {
    const usersWhoLikedCommentByUser = await Promise.all(
        keys.map(async ({ userId, commentId }) => {
            const usersWhoLikedComment = await postsRepository.getUsersWhoLikedComment({ userId, commentId })
            return { userId, commentId, usersWhoLikedComment }
        })
    )

    const usersWhoLikedCommentByUserObject = usersWhoLikedCommentByUser
        .reduce((result, { userId, commentId, usersWhoLikedComment }) => ({
            ...result,
            [generateKey({ userId, commentId })]: usersWhoLikedComment
        }), {})

    return keys.map(key => usersWhoLikedCommentByUserObject[generateKey(key)])
}, { cacheKeyFn: generateKey })

export default usersWhoLikedCommentLoader