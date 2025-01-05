
'use server'
import { PrismaClient } from "@prisma/client"
import { TestDefinitionAtom, TestQuestionMappingAtom } from "../store/myTestAtom"
import { getServerSession } from "next-auth"
import { getUserDetails } from "./commonActions"

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

    if (testDef.testId) {
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
            description: testDef.description,
            category: testDef.category,
            questionSortOrder: 'Random',
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
                }
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
            isCorrect: boolean }[])
        }))
      }
    
//   const testDefinition: TestQuestionMappingAtom = await response.json()
  return testDefinition
}
