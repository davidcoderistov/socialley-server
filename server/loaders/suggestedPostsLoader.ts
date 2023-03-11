import DataLoader from 'dataloader'
import postsRepository from '../repositories/postsRepository'


const suggestedPostsLoader = new DataLoader(async (userIds: string[]) => {
    const suggestedPostsByUser = await Promise.all(
        userIds.map(async (userId) => {
            const suggestedPosts = await postsRepository.getSuggestedPosts({ userId })
            return { userId, suggestedPosts }
        })
    )

    const suggestedPostsByUserObject = suggestedPostsByUser
        .reduce((result, { userId, suggestedPosts }) => ({
            ...result,
            [userId]: suggestedPosts
        }), {})

    return userIds.map((userId) => suggestedPostsByUserObject[userId])
})

export default suggestedPostsLoader