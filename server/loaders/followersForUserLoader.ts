import DataLoader from 'dataloader'
import userRepository from '../repositories/userRepository'


interface LoaderKey {
    loggedInUserId: string
    userId: string
}

const generateKey = (loaderKey: LoaderKey) => `${loaderKey.loggedInUserId}-${loaderKey.userId}`

const followersForUserLoader = new DataLoader(async (keys: LoaderKey[]) => {
    const followersForUserByUser = await Promise.all(
        keys.map(async ({ loggedInUserId, userId }) => {
            const followersForUser = await userRepository.getFollowersForUser({ loggedInUserId, userId })
            return { loggedInUserId, userId, followersForUser }
        })
    )

    const followersForUserByUserObject = followersForUserByUser
        .reduce((result, { loggedInUserId, userId, followersForUser }) => ({
            ...result,
            [generateKey({ loggedInUserId, userId })]: followersForUser
        }), {})

    return keys.map(key => followersForUserByUserObject[generateKey(key)])
}, { cacheKeyFn: generateKey })

export default followersForUserLoader