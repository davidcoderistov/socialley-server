import DataLoader from 'dataloader'
import postsRepository from '../repositories/postsRepository'


const postLikeNotificationsLoader = new DataLoader(async (userIds: string[]) => {
    const postLikeNotificationsByUser = await Promise.all(
        userIds.map(async (userId) => {
            const postLikeNotifications = await postsRepository.getPostLikeNotificationsForUser({ userId })
            return { userId, postLikeNotifications }
        })
    )

    const postLikeNotificationsByUserObject = postLikeNotificationsByUser
        .reduce((result, { userId, postLikeNotifications }) => ({
            ...result,
            [userId]: postLikeNotifications
        }), {})

    return userIds.map((userId) => postLikeNotificationsByUserObject[userId])
})

export default postLikeNotificationsLoader