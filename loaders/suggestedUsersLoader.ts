import DataLoader from 'dataloader'
import userRepository from '../repositories/userRepository'


const suggestedUsersLoader = new DataLoader(async (userIds: string[]) => {
    const suggestedUsersByUser = await Promise.all(
        userIds.map(async (userId) => {
            const suggestedUsers = await userRepository.getSuggestedUsers({ userId })
            return { userId, suggestedUsers }
        })
    )

    const suggestedUsersByUserObject = suggestedUsersByUser
        .reduce((result, { userId, suggestedUsers }) => ({
            ...result,
            [userId]: suggestedUsers
        }), {})

    return userIds.map((userId) => suggestedUsersByUserObject[userId])
})

export default suggestedUsersLoader