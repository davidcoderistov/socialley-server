import DataLoader from 'dataloader'
import userRepository from '../repositories/userRepository'


interface LoaderKey {
    loggedInUserId: string
    userId: string
}

const generateKey = (loaderKey: LoaderKey) => `${loaderKey.loggedInUserId}-${loaderKey.userId}`

const followingForUserLoader = new DataLoader(async (keys: LoaderKey[]) => {
    const followingForUserByUser = await Promise.all(
        keys.map(async ({ loggedInUserId, userId }) => {
            const followingForUser = await userRepository.getFollowingForUser({ loggedInUserId, userId })
            return { loggedInUserId, userId, followingForUser }
        })
    )

    const followingForUserByUserObject = followingForUserByUser
        .reduce((result, { loggedInUserId, userId, followingForUser }) => ({
            ...result,
            [generateKey({ loggedInUserId, userId })]: followingForUser
        }), {})

    return keys.map(key => followingForUserByUserObject[generateKey(key)])
}, { cacheKeyFn: generateKey })

export default followingForUserLoader