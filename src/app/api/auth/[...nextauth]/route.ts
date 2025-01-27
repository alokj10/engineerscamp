import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { logger } from '@/app/utils/logger';
import { TestRespondentAtom } from '@/app/store/myTestAtom';
import { getRespondentInfoForSession } from '@/app/actions/qzActions';

const prisma = new PrismaClient();

const handler = NextAuth({
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
        if(credentials?.credentialType === 'admin') {
          return authorizeAdminUser(credentials);
        }
        else {
          return authorizeRespondent(credentials);
        }
        // logger.info(`Credential-Access triggered: ${JSON.stringify(credentials)}`);
        // if (!credentials?.email || !credentials?.password) {
        //   throw new Error('Please enter your email and password');
        // }

        // const user = await prisma.user.findUnique({
        //   where: {
        //     email: credentials.email
        //   }
        // });
        // logger.info(`User found: ${JSON.stringify(user)}`);

        // if (!user) {
        //   throw new Error('No user found with this email');
        // }

        // logger.info(`credentials: ${credentials.password}`);
        // let passwordMatch = await bcrypt.compare(credentials.password, user.password);
        // if (!passwordMatch) {
        //   throw new Error('Invalid password');
        // }
        
        // if (!user.isActive) {
        //   throw new Error('Please activate your account first');
        // }

        // return {
        //   id: user.id.toString(),
        //   email: user.email,
        //   name: user.name,
        //   userType: user.userType
        // };
      }
    }),
    CredentialsProvider({
      name: 'Respondent',
      credentials: {
        accessCode: { label: "Access Code", type: "text" },
        firstName: { label: "First Name", type: "text" },
        lastName: { label: "Last Name", type: "text" },
        email: { label: "Email", type: "email" }
      },
      async authorize(credentials) {
        return authorizeRespondent(credentials);
        // logger.info(`Respondent-Access triggered: ${JSON.stringify(credentials)}`);
        // if (!credentials?.email || !credentials?.firstName || !credentials?.lastName || !credentials?.accessCode) {
        //   throw new Error('Please enter access code, your first name, last name and email');
        // }

        // const testRespondent: TestRespondentAtom = {
        //   accessCode: credentials.accessCode,
        //   firstName: credentials.firstName,
        //   lastName: credentials.lastName,
        //   email: credentials.email,
        //   testId: 0,
        //   respondentId: 0,
        // };

        // const testRespondentInfo = await getRespondentInfoForSession(testRespondent);
        // logger.info(`Test Respondent found: ${JSON.stringify(testRespondentInfo)}`);

        // if (!testRespondentInfo) {
        //   throw new Error('No test found');
        // }

        // return {
        //   id: testRespondentInfo.respondentId.toString(),
        //   email: testRespondentInfo.email,
        //   name: testRespondentInfo.firstName + ' ' + testRespondentInfo.lastName,
        //   userType: 'respondent'
        // };
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      // alert('jwt triggered');
      if (user) {
        token.userType = user.userType;
      }
      return token;
    },
    async session({ session, token }) {
      // alert('session triggered');
      if (session.user) {
        session.user.userType = token.userType;
      }
      return session;
    },
    signIn: async ({ user, account, profile, email, credentials }) => {
      // alert('account?.provider: ' + account?.provider);
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

async function authorizeAdminUser(credentials: any) {
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

async function authorizeRespondent(credentials: any) {
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
    id: testRespondentInfo.respondentId.toString(),
    email: testRespondentInfo.email,
    name: testRespondentInfo.firstName + ' ' + testRespondentInfo.lastName,
    userType: 'respondent'
  };
}
export { handler as GET, handler as POST };