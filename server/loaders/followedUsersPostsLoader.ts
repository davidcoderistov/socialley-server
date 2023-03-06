import DataLoader from 'dataloader'
import postsRepository from '../repositories/postsRepository'


const followedUsersPostsLoader = new DataLoader(async (userIds: string[]) => {
    const followedUsersPostsByUser = await Promise.all(
        userIds.map(async (userId) => {
            const followedUsersPosts = await postsRepository.getAllFollowedUsersPosts({ userId })
            return { userId, followedUsersPosts }
        })
    )

    const followedUsersPostsByUserObject = followedUsersPostsByUser
        .reduce((result, { userId, followedUsersPosts }) => ({
            ...result,
            [userId]: followedUsersPosts
        }), {})

    return userIds.map((userId) => followedUsersPostsByUserObject[userId])
})

export default followedUsersPostsLoader

