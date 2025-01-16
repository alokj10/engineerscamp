
'use server'
import { PrismaClient } from "@prisma/client"
import { TestDefinitionAtom, TestQuestionMappingAtom, TestRespondentAtom } from "../store/myTestAtom"
import { getServerSession } from "next-auth"
import { getUserDetails } from "./commonActions"
import { TestStatus } from "../Constants"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

export async function createTest(testDef: TestDefinitionAtom) {
    const session = await getServerSession()
    const currentUser = await prisma.user.findUnique({
        where: { email: session?.user?.email || '' }
    })

    if (!currentUser) {
        throw new Error('Unauthorized: Only admin users can create tests')
    }

    const currentTimestamp = new Date().toISOString()

    if (testDef.testId > 0) {
        const test = await prisma.tests.update({
            where: {
                id: testDef.testId
            },
            data: {
                name: testDef.name,
                description: testDef.description,
                category: testDef.category,
                questionSortOrder: testDef.questionSortOrder
            }
        })
        return test
    }

    const test = await prisma.tests.create({
        data: {
            name: testDef.name,
            description: testDef.description || '',
            category: testDef.category,
            questionSortOrder: 'Random',
            status: TestStatus.Draft,
            createUserId: currentUser.id,
            createdOn: currentTimestamp
        }
    })

    return test
}

export async function getTestDefinitionById(testId: number): Promise<TestQuestionMappingAtom> {
  const test = await prisma.tests.findUnique({
      where: {
          id: testId,
      },
      include: {
          testQuestionMappings: {
              include: {
                  questionAnswerMapping: {
                      include: {
                          question: true,
                          answerOption: true
                      }
                  }
              }
          },
          TestAccessCodes: {
            include: {
                  respondent: true
              }
          }
        //   respondents: {
        //       include: {
        //           testAccessCodes: true
        //       }
        //   }
      }
  })
    
  if(test === null) {
      throw new Error('Test not found')
  }

  const createdBy = await getUserDetails(test.createUserId);
    
  const testDefinition: TestQuestionMappingAtom = {
      id: test.id,
      test: {
          testId: test.id,
          name: test.name,
          description: test.description,
          category: test.category,
          status: test.status,
          questionSortOrder: test.questionSortOrder,
          language: 'English',
          createdBy: createdBy?.name || '',
          createdOn: test.createdOn.toISOString()
      },
      questionAnswerDefinitions: test.testQuestionMappings.map(tqm => ({
          question: {
              questionId: tqm.questionAnswerMapping.question.id,
              question: tqm.questionAnswerMapping.question.question,
              category: tqm.questionAnswerMapping.question.category,
              type: tqm.questionAnswerMapping.question.type,
              createdBy: createdBy?.name || '',
              createdOn: tqm.questionAnswerMapping.question.createdOn.toISOString()
          },
          answerOptions: test.testQuestionMappings.reduce((acc, mapping) => {
              if (mapping.questionAnswerMapping.question.id) {
                  acc.push({
                      answerOptionId: mapping.questionAnswerMapping.answerOption.id,
                      answer: mapping.questionAnswerMapping.answerOption.answer,
                      category: mapping.questionAnswerMapping.answerOption.category,
                      createdBy: createdBy?.name || '',
                      createdOn: mapping.questionAnswerMapping.answerOption.createdOn.toISOString(),
                      isCorrect: mapping.questionAnswerMapping.isCorrect
                  })
              }
              return acc
          }, [] as { 
              answerOptionId: number; 
              answer: string; 
              category: string, 
              createdBy: string,
              createdOn: string,
              isCorrect: boolean 
          }[])
      })),
      testRespondents: test.TestAccessCodes.map((tac) => {

        let decodeString = decodeAccessCode(tac.code.split("-")[tac.code.split("-").length-1])
        let tr = {
          respondentId: tac.respondentId,
          firstName: tac.respondent.firstName || '',
          lastName: tac.respondent.lastName || '',
          email: tac.respondent.email || '',
          testId: test.id,
          accessCode: `${tac.code}, ${JSON.stringify(decodeString)}` || ''
        }
        return tr
      })
  }
    
  return testDefinition
}

export async function getTests(): Promise<TestDefinitionAtom[]> {
    const session = await getServerSession()
    const currentUser = await prisma.user.findUnique({
        where: { email: session?.user?.email || '' }
    })

    if (!currentUser) {
        throw new Error('User not found')
    }

    const tests = await prisma.tests.findMany({
        where: {
            createUserId: currentUser.id
        },
        include: {
            createdBy: {
                select: {
                    name: true
                }
            }
        }
    })

    return tests.map(test => ({
        testId: test.id,
        name: test.name,
        description: test.description,
        category: test.category,
        language: 'English',
        status: test.status,
        questionSortOrder: test.questionSortOrder,
        createdBy: test.createdBy.name || undefined,
        createdOn: test.createdOn.toISOString()
    }))
}

export async function createCategory(categoryName: string) {
    const session = await getServerSession()
    console.log('session- createCategory', session)
    const currentUser = await prisma.user.findUnique({
        where: { email: session?.user?.email || '' }
    })
    console.log('createCategory', categoryName)
    if (currentUser == null || currentUser == undefined) {
        console.error('User not found')
        throw new Error('User not found')
    }

    const category = await prisma.testCategory.create({
        data: {
            name: categoryName,
            createUserId: currentUser.id
        }
    })

    return category
}

export async function getCategories() {
    const session = await getServerSession()
    const currentUser = await prisma.user.findUnique({
        where: { email: session?.user?.email || '' }
    })

    if (!currentUser) {
        throw new Error('User not found')
    }

    const categories = await prisma.testCategory.findMany({
        where: {
            createUserId: currentUser.id
        },
        select: {
            name: true
        }
    })

    return categories
}
import crypto from 'crypto'
import { logger } from "../utils/logger"
import { getCurrentDateTime } from "../utils/dateTimeUtils"

export async function saveRespondents(testId: number, respondents: TestRespondentAtom[]) {
    const session = await getServerSession()
    const currentUser = await prisma.user.findUnique({
        where: { email: session?.user?.email || '' }
    })

    const salt = 'engineerscamp'
    const savedRespondents = []

    for (const respondent of respondents) {
        // Find or create respondent
        let dbRespondent = await prisma.respondent.upsert({
            where: { email: respondent.email },
            update: {
                firstName: respondent.firstName,
                lastName: respondent.lastName
            },
            create: {
                email: respondent.email,
                firstName: respondent.firstName,
                lastName: respondent.lastName
            }
        })

        
        let now = new Date()
        let timestamp = `${now.getDate()}${now.getMonth()+1}${now.getFullYear().toString().substring(2,4)}${now.getHours()}${now.getMinutes()}`
        const codeString = `${testId}-${dbRespondent.id}-${timestamp}`
        // const hash = crypto
        //     .createHmac('sha256', salt)
        //     .update(codeString)
        //     .digest('hex')
        //     .substring(0, 8)

        // const accessCode = `${codeString}-${hash}`
        let bufferObj = Buffer.from(codeString, "utf8")
        const accessCode = bufferObj.toString('base64')
        
        // Create or update test access code
        const testAccess = await prisma.testAccessCodes.upsert({
            where: {
                testId_respondentId: {
                    testId: testId,
                    respondentId: dbRespondent.id
                }
            },
            update: {
                code: accessCode
            },
            create: {
                testId: testId,
                respondentId: dbRespondent.id,
                code: accessCode
            }
        })

        savedRespondents.push({
            ...respondent,
            respondentId: dbRespondent.id,
            accessCode: accessCode
        })
    }

    return savedRespondents
}

export async function saveGradingSettings(testId: number, settings: TestDefinitionAtom) {
    const session = await getServerSession()
    const currentUser = await prisma.user.findUnique({
        where: { email: session?.user?.email || '' }
    })

    logger.info(`[saveGradingSettings] Starting update for test ${testId}`)

    const updatedTest = await prisma.tests.update({
        where: { id: testId },
        data: {
            completionMessage: settings.completionMessage,
            passingScore: settings.passingScore,
            passingScoreUnit: settings.passingScoreUnit,
            showResults: settings.showResults,
            showPassFailMessage: settings.showPassFailMessage,
            showScore: settings.showScore,
            showCorrectAnswer: settings.showCorrectAnswer,
            passMessage: settings.passMessage,
            failMessage: settings.failMessage,
            resultRecipients: settings.resultRecipients,
            updatedOn: getCurrentDateTime()
        }
    })

    logger.info(`[saveGradingSettings] Successfully updated grading settings for test ${testId}`)
    return updatedTest
}

function decodeAccessCode(accessCode: string): { 
    testId: number, 
    respondentId: number, 
    timestamp: string 
} {
    // const salt = 'engineerscamp'
    // const [testId, respondentId, timestamp, hash] = accessCode.split('-')

    // const codeString = `${testId}-${respondentId}-${timestamp}`
    // const expectedHash = crypto
    //     .createHmac('sha256', salt)
    //     .update(codeString)
    //     .digest('hex')
    //     .substring(0, 8)

    // if (hash !== expectedHash) {
    //     throw new Error('Invalid access code')
    // }
    try
    {
        let bufferObj = Buffer.from(accessCode, "base64")
        let codeString = bufferObj.toString('utf8')
        const [testId, respondentId, timestamp] = codeString.split('-')
        // const decodeObj = jwt.verify(accessCode, 'engineerscamp') as {
        //     testId: string | '-1',
        //     respondentId: string | '-1',
        //     timestamp: string | ''
        // }
        return {
            testId: parseInt(testId),
            respondentId: parseInt(respondentId),
            timestamp: timestamp?.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1-$2-$3 $4:$5')
        }
    }
    catch (error) {
        // throw new Error('Invalid access code: ' + error)
        return {
            testId: -1,
            respondentId: -1,
            timestamp: ''
        }
    }
}