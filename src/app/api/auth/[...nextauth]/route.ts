import NextAuth, { DefaultSession, NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { logger } from '@/app/utils/logger';
import { TestRespondentAtom } from '@/app/store/myTestAtom';
import { getRespondentInfoForSession } from '@/app/actions/qzActions';

const prisma = new PrismaClient();


declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      userType: string;
    } & DefaultSession["user"];
  }
}

const handler: NextAuthOptions = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        credentialType: { label: "Credential Type", type: "text" },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        accessCode: { label: "Access Code", type: "text" },
        firstName: { label: "First Name", type: "text" },
        lastName: { label: "Last Name", type: "text" }
      },
      async authorize(credentials) {
        let authObj: {
          id: string,
          email: string,
          name: string,
          userType: string
        } = {
          id: '-1',
          email: '',
          name: '',
          userType: ''
        };
        if(credentials?.credentialType === 'admin') {
          authObj = await authorizeAdminUser(credentials);
        }
        else {
          authObj = await authorizeRespondent(credentials);
        }
        return {
          id: authObj.id.toString(),
          email: authObj.email,
          name: authObj.name,
          userType: authObj.userType
        }; 
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/error',
  },
  callbacks: {
    async jwt({ token, user, profile, account, trigger, session }) {
      logger.info(`JWT Auth Token: ${JSON.stringify(token)}`);
      logger.info(`JWT Auth User: ${JSON.stringify(user)}`);
      // if (user) {
      //   logger.info(`JWT User available: ${JSON.stringify(user)}`);
      //   token.id = user.id;
      //   // token.user.id = user.id;
      //   token.userType = user.userType;
      // }
      token.id = user?.id;
      token.userType = user?.userType || '';
      return token;
    },
    async session({ session, user, token }) {
      if (token) {
        logger.info(`Session user available : ${JSON.stringify(token)}`);
        
        session.user.id = token?.sub || '';
        session.user.userType = token?.userType || '';
      }
      logger.info(`Session Auth : ${JSON.stringify(session)}`);
      return session;
    },
    signIn: async ({ user, account, profile, email, credentials }) => {
      if (account?.provider === 'credentials') {
        return true;
      }
      return true;
    }
  },
  session: {
    strategy: 'jwt',
  }
});

async function authorizeAdminUser(credentials: any): Promise<{
  id: string,
  email: string,
  name: string,
  userType: string
}> {
  logger.info(`Credential-Access triggered: ${JSON.stringify(credentials)}`);
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
  let passwordMatch = await bcrypt.compare(credentials.password, user.password);
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

async function authorizeRespondent(credentials: any): Promise<{
  id: string,
  email: string,
  name: string,
  userType: string
}>  {
  logger.info(`Respondent-Access triggered: ${JSON.stringify(credentials)}`);
  if (!credentials?.email || !credentials?.firstName || !credentials?.lastName || !credentials?.accessCode) {
    throw new Error('Please enter access code, your first name, last name and email');
  }

  const testRespondent: TestRespondentAtom = {
    accessCode: credentials.accessCode,
    firstName: credentials.firstName,
    lastName: credentials.lastName,
    email: credentials.email,
    testId: 0,
    respondentId: 0,
  };

  const testRespondentInfo = await getRespondentInfoForSession(testRespondent);
  logger.info(`Test Respondent found: ${JSON.stringify(testRespondentInfo)}`);

  if (!testRespondentInfo) {
    throw new Error('No test found');
  }

  return {
    id: testRespondentInfo.testAccessId?.toString() || '',
    email: testRespondentInfo.email,
    name: testRespondentInfo.firstName + ' ' + testRespondentInfo.lastName,
    userType: 'respondent'
  };
}

// const handler = NextAuth(authOptions);
// export default handler;
export const authOptions = handler;
export { handler as GET, handler as POST };
