import DataLoader from 'dataloader'
import postsRepository from '../repositories/postsRepository'


interface LoaderKey {
    userId: string
    postId: string
}

const generateKey = (loaderKey: LoaderKey) => `${loaderKey.userId}-${loaderKey.postId}`

const usersWhoLikedPostLoader = new DataLoader(async (keys: LoaderKey[]) => {
    const usersWhoLikedPostByUser = await Promise.all(
        keys.map(async ({ userId, postId }) => {
            const usersWhoLikedPost = await postsRepository.getUsersWhoLikedPost({ userId, postId })
            return { userId, postId, usersWhoLikedPost }
        })
    )

    const usersWhoLikedPostByUserObject = usersWhoLikedPostByUser
        .reduce((result, { userId, postId, usersWhoLikedPost }) => ({
            ...result,
            [generateKey({ userId, postId })]: usersWhoLikedPost
        }), {})

    return keys.map(key => usersWhoLikedPostByUserObject[generateKey(key)])
}, { cacheKeyFn: generateKey })

export default usersWhoLikedPostLoader