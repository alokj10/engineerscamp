import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { logger } from '@/app/utils/logger';

const prisma = new PrismaClient();

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password');
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });
        logger.info(`User found: ${JSON.stringify(user)}`);

        if (!user) {
          throw new Error('No user found with this email');
        }

        logger.info(`credentials: ${credentials.password}`);
        // const encryptedUserPassword1 = await bcrypt.hash(credentials.password, 10);
        // const encryptedUserPassword2 = await bcrypt.hash(credentials.password, 10);
        // logger.info(`Encrypted password 1: ${encryptedUserPassword1}`);
        // logger.info(`Encrypted password 2: ${encryptedUserPassword2}`);
        // logger.info(`User password: ${user.password}`);
        // let passwordMatch = await bcrypt.compare(credentials.password, '$2b$10$mrIcs7yCoQjB.Kf6lRaeq.ZolF44QnEeEEL/68RGvUfAnG56NcQHu');
        // const p2 = bcrypt.compareSync(user.password, encryptedUserPassword2);
        // logger.info(`Password match 1: ${passwordMatch}`);
        let passwordMatch = await bcrypt.compare(credentials.password, user.password);
        // logger.info(`Password match 2: ${passwordMatch}`);
        // logger.info(`P2: ${p2}`);
        if (!passwordMatch) {
          throw new Error('Invalid password');
        }
        
        if (!user.isActive) {
          throw new Error('Please activate your account first');
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          userType: user.userType
        };
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userType = user.userType;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.userType = token.userType;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt',
  }
});

export { handler as GET, handler as POST };