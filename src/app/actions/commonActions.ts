import { PrismaClient, User } from "@prisma/client"

const prisma = new PrismaClient()

export const getUserDetails = async (userId: number): Promise<User | null> => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })
    if (!user) {
        console.error('User not found')
        return null
    }
    return user
}