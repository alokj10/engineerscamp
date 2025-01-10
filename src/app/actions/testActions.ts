
'use server'
import { PrismaClient } from "@prisma/client"
import { TestDefinitionAtom, TestQuestionMappingAtom } from "../store/myTestAtom"
import { getServerSession } from "next-auth"
import { getUserDetails } from "./commonActions"
import { TestStatus } from "../Constants"

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
            isCorrect: boolean }[])
        }))
      }
    
//   const testDefinition: TestQuestionMappingAtom = await response.json()
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
