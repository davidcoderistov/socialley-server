import DataLoader from 'dataloader'
import userRepository from '../repositories/userRepository'


const followNotificationsLoader = new DataLoader(async (userIds: string[]) => {
    const followNotificationsByUser = await Promise.all(
        userIds.map(async (userId) => {
            const followNotifications = await userRepository.getFollowNotificationsForUser({ userId })
            return { userId, followNotifications }
        })
    )

    const followNotificationsByUserObject = followNotificationsByUser
        .reduce((result, { userId, followNotifications }) => ({
            ...result,
            [userId]: followNotifications
        }), {})

    return userIds.map((userId) => followNotificationsByUserObject[userId])
})

export default followNotificationsLoader