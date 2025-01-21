
'use server'
import { PrismaClient } from "@prisma/client"
import { TestDefinitionAtom, TestQuestionMappingAtom, TestRespondentAtom } from "../store/myTestAtom"
import { getServerSession } from "next-auth"
import { getUserDetails } from "./commonActions"
import { TestStatus } from "../Constants"
import nodemailer from 'nodemailer'

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
        await prisma.tests.update({
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
        return {
            testId: testDef.testId, 
            message: 'Test updated successfully' 
        }
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

    return {
        testId: test.id,
        message: 'Test created successfully'
    }
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
    
    // const answersGroupByQuestion = Object.groupBy(test.testQuestionMappings, (qm) => {
    //     return qm.questionAnswerMapping.questionId
    // })
    // let questionAnswerDefinitions: QuestionAnswerDefinitionAtom[] = []
    
    // Object.keys(answersGroupByQuestion).forEach(async questionId => {
    //     let answers = answersGroupByQuestion[Number(questionId)]
    //     if (answers && answers.length > 0) {
    //         let createdBy = await getUserDetails(answers[0].questionAnswerMapping.answerOption.createUserId)
    //         questionAnswerDefinitions.push({
    //             question: {
    //                 questionId: Number(questionId),
    //                 question: answers[0].questionAnswerMapping.question.question,
    //                 category: answers[0].questionAnswerMapping.question.category,
    //                 createdBy: createdBy?.name || '',
    //                 type: answers[0].questionAnswerMapping.question.type,
    //                 createdOn: convertDateTimeToString(answers[0].questionAnswerMapping.question.createdOn) || ''
    //             },
    //             answerOptions: answers.map(a => {
    //                 return {
    //                     answerOptionId: a.questionAnswerMapping.answerOption.id,
    //                     answer: a.questionAnswerMapping.answerOption.answer,
    //                     isCorrect: a.questionAnswerMapping.isCorrect,
    //                     createdBy: createdBy?.name || '',
    //                     category: a.questionAnswerMapping.answerOption.category,
    //                     createdOn: convertDateTimeToString(a.questionAnswerMapping.answerOption.createdOn) || ''
    //                 }
    //             })
    //         })
    //     }
    // })
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
          completionMessage: test.completionMessage || '',
          passingScore:     test.passingScore || undefined,
          passingScoreUnit:     test.passingScoreUnit || '',
          showResults:     test.showResults || undefined,
          showPassFailMessage:     test.showPassFailMessage || undefined,
          showScore:     test.showScore || undefined,
          showCorrectAnswer:     test.showCorrectAnswer || undefined,
          passMessage:     test.passMessage || '',
          failMessage:     test.failMessage || '',
          resultRecipients:     test.resultRecipients || '',
          testActivationMethod:     test.testActivationMethod || '',
          manualActivationPeriod:     test.manualActivationPeriod || undefined,
          testDurationMethod:     test.testDurationMethod || '',
          testDurationForTest:     test.testDurationForTest || undefined,
          testDurationForQuestion:     test.testDurationForQuestion || undefined,
          scheduledActivationStartsOn: convertDateTimeToString(test.scheduledActivationStartsOn) || undefined,
          scheduledActivationEndsOn:   convertDateTimeToString(test.scheduledActivationEndsOn) || undefined,
          createdBy: createdBy?.name || '',
          createdOn: test.createdOn.toISOString()
      },
    //   questionAnswerDefinitions: test.testQuestionMappings.map(tqm => ({
    //       question: {
    //           questionId: tqm.questionAnswerMapping.question.id,
    //           question: tqm.questionAnswerMapping.question.question,
    //           category: tqm.questionAnswerMapping.question.category,
    //           type: tqm.questionAnswerMapping.question.type,
    //           createdBy: createdBy?.name || '',
    //           createdOn: tqm.questionAnswerMapping.question.createdOn.toISOString()
    //       },
    //       answerOptions: test.testQuestionMappings.reduce((acc, mapping) => {
    //           if (mapping.questionAnswerMapping.question.id === tqm.questionAnswerMapping.question.id) {
    //               acc.push({
    //                   answerOptionId: mapping.questionAnswerMapping.answerOption.id,
    //                   answer: mapping.questionAnswerMapping.answerOption.answer,
    //                   category: mapping.questionAnswerMapping.answerOption.category,
    //                   createdBy: createdBy?.name || '',
    //                   createdOn: mapping.questionAnswerMapping.answerOption.createdOn.toISOString(),
    //                   isCorrect: mapping.questionAnswerMapping.isCorrect
    //               })
    //           }
    //           return acc
    //       }, [] as { 
    //           answerOptionId: number; 
    //           answer: string; 
    //           category: string, 
    //           createdBy: string,
    //           createdOn: string,
    //           isCorrect: boolean 
    //       }[])
      questionAnswerDefinitions: getQuestionAnswers(test.testQuestionMappings),
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

function getQuestionAnswers(questionMappings: any[]): QuestionAnswerDefinitionAtom[] {
    const groupedByQuestion = questionMappings.reduce((acc, mapping) => {
      if (!acc[mapping.questionAnswerMapping.questionId]) {
        acc[mapping.questionAnswerMapping.questionId] = {
          question: {
            questionId: mapping.questionAnswerMapping.question.id,
            question: mapping.questionAnswerMapping.question.question,
            category: mapping.questionAnswerMapping.question.category,
            type: mapping.questionAnswerMapping.question.type,
            createdOn: mapping.questionAnswerMapping.question.createdOn
          }, 
        //   mapping.questionAnswerMapping.question as QuestionDefinition,
          answerOptions: []
        }
      }
      acc[mapping.questionAnswerMapping.questionId]
            .answerOptions
            .push({
                answerOptionId: mapping.questionAnswerMapping.answerOption.answerOptionId,
                answer: mapping.questionAnswerMapping.answerOption.answer,
                category: mapping.questionAnswerMapping.answerOption.category,
                createdOn: mapping.questionAnswerMapping.answerOption.createdOn,
                isCorrect: mapping.questionAnswerMapping.isCorrect
            })
      console.log('acc', acc)
      return acc
    }, {} as Record<string, QuestionAnswerDefinitionAtom>)

    const result = Object.values(groupedByQuestion) as QuestionAnswerDefinitionAtom[]
    console.log('result', result)
    return result
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
import { convertDateTimeToString, convertToDateTime, getCurrentDateTime, getIsoDateTimeString } from "../utils/dateTimeUtils"
import { AnswerOptionDefinition, QuestionAnswerDefinitionAtom, QuestionDefinition } from "../store/questionAnswerDefinitionAtom"

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
            updatedOn: getIsoDateTimeString()
        }
    })

    logger.info(`[saveGradingSettings] Successfully updated grading settings for test ${testId}`)
    return updatedTest
}

export async function saveTimeSettings(testId: number, settings: TestDefinitionAtom) {
    const session = await getServerSession()
    const currentUser = await prisma.user.findUnique({
        where: { email: session?.user?.email || '' }
    })

    logger.info(`Updating time settings for test ${testId}: ${settings.manualActivationPeriod}`)

    const updatedTest = await prisma.tests.update({
        where: { id: testId },
        data: {
            testActivationMethod: settings.testActivationMethod,
            manualActivationPeriod: settings.manualActivationPeriod || null,
            testDurationMethod: settings.testDurationMethod,
            testDurationForTest: settings.testDurationForTest || null,
            testDurationForQuestion: settings.testDurationForQuestion || null,
            scheduledActivationStartsOn: convertToDateTime(settings.scheduledActivationStartsOn) || null,
            scheduledActivationEndsOn: convertToDateTime(settings.scheduledActivationEndsOn) || null,
            updatedOn: getIsoDateTimeString()
        }
    })

    logger.info(`Successfully updated time settings for test ${testId}`)
    return updatedTest
}

export async function activateTest(testId: number) {
    const session = await getServerSession()
    const currentUser = await prisma.user.findUnique({
        where: { email: session?.user?.email || '' }
    })

    if (!currentUser) {
        throw new Error('Unauthorized: User not found')
    }

    const currentTest = await prisma.tests.findUnique({
        where: { id: testId },
        include: {
            testQuestionMappings: true,
            TestAccessCodes: {
                include: {
                    respondent: true
                }
            }
        }
    })

    if (!currentTest) {
        throw new Error('Test not found')
    }

    if (currentTest.status !== 'SETUPINPROGRESS') {
        throw new Error('Test can only be activated from SETUPINPROGRESS status')
    }

    if (currentTest.testQuestionMappings.length === 0) {
        throw new Error('Test must have at least one question before activation')
    }

    if (currentTest.testAccessMode === 'AccessCode' && currentTest.TestAccessCodes.length === 0) {
        throw new Error('Test with AccessCode mode must have at least one access code')
    }

    const currentDateTime = new Date().toISOString()

    const updatedTest = await prisma.tests.update({
        where: { id: testId },
        data: {
            status: 'ACTIVE',
            updatedOn: currentDateTime,
            activatedOn: currentDateTime
        }
    })

    let respondents: TestRespondentAtom[] = []
    if (currentTest.testAccessMode === 'AccessCode') {
        currentTest.TestAccessCodes.map(accessCode => {
            respondents.push({
                testId: accessCode.testId,
                respondentId: accessCode.respondentId,
                accessCode: accessCode.code,
                firstName: accessCode.respondent.firstName || '',
                lastName: accessCode.respondent.lastName || '',
                email: accessCode.respondent.email || '',
            })
        })
        if (respondents && respondents.length > 0) {
            respondents.map(async (respondent) => {
                await sendNotification(respondent.email, 
                    process.env.GMAIL_USER || '', 
                    'Test Activation', 
                    `You have been invited to take an online test. 
                    Please use the below access code to start the test.
                    ${respondent.accessCode}`)
            })
        }
    }
    return updatedTest
}

export async function sendNotification(to: string, 
    from: string, 
    subject: string, 
    body: string) {
    logger.info(`Sending email from: ${process.env.GMAIL_USER}, to: ${to}`);
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD // Use an app password for better security
      }
    });
    // Set up email data
    let mailOptions = {
      from: process.env.GMAIL_USER, // Sender address
      to: to, // List of recipients
      subject: subject, // Subject line
      //text: body, // Plain text body
      html: body // HTML body
    };
  
    // Send mail with defined transport object
    transporter.sendMail(mailOptions, (error: any, info: any) => {
      if (error) {
          return logger.error(error);
      }
      logger.info('Message sent: ' + info);
    });
  };

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