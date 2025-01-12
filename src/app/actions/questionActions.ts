'use server'
import { PrismaClient } from "@prisma/client"
import { QuestionAnswerDefinitionAtom } from "../store/questionAnswerDefinitionAtom"
import { getServerSession } from "next-auth"
import { TestDefinitionAtom, TestQuestionMappingAtom } from "../store/myTestAtom"
import { getTestDefinitionById } from "./testActions"
import { logger } from "../utils/logger"

const prisma = new PrismaClient()

export async function createQuestionAnswer(testQuestionMappingAtom: TestQuestionMappingAtom) {
    const session = await getServerSession()
    const currentUser = await prisma.user.findUnique({
        where: { email: session?.user?.email || '' }
    })

    if (!currentUser) {
        throw new Error('Unauthorized: Only admin users can create questions')
    }

    const currentTimestamp = new Date().toISOString()
    const { id, questionAnswerDefinitions, test } = testQuestionMappingAtom;
    logger.log(`testQuestionMappingAtom: ${JSON.stringify(testQuestionMappingAtom)}`)
    updateTestQuestionMapping(testQuestionMappingAtom)
    return getTestDefinitionById(test.testId)

    /*
    const question = await prisma.questions.create({
        data: {
            question: questionAnswerDef.question.question,
            category: questionAnswerDef.question.category,
            type: questionAnswerDef.question.type,
            createUserId: currentUser.id,
            createdOn: currentTimestamp
        }
    })

    const answerOptions = await Promise.all(
        questionAnswerDef.answerOptions.map(async (option) => {
            const answerOption = await prisma.answerOptions.create({
                data: {
                    answer: option.answer,
                    category: question.category,
                    createUserId: currentUser.id,
                    createdOn: currentTimestamp
                }
            })

            const qaMapping = await prisma.questionAnswerMappings.create({
                data: {
                    questionId: question.id,
                    answerOptionId: answerOption.id,
                    isCorrect: option.isCorrect
                }
            })

            const testQuestionMapping = await prisma.testQuestionMappings.create({
              data: {
                testId: 1,
                questionAnswerMappingId: qaMapping.id
              }
            })

            return testQuestionMapping
        })
    )
        */

    // return {
    //     question,
    //     answerOptions
    // }
}

export async function getQuestionsByCategory(userId: number, category?: string) {
    const questions = await prisma.questions.findMany({
        where: {
            createUserId: userId,
            ...(category && { category: category })
        },
        include: {
            answers: {
                include: {
                    answerOption: true
                }
            }
        }
    })

    const questionAnswerDefs: QuestionAnswerDefinitionAtom[] = questions.map(question => ({
        question: {
            questionId: question.id,
            question: question.question,
            category: question.category,
            type: question.type,
            createdBy: question.userId,
            createdOn: question.createdOn
        },
        answerOptions: question.answers.map(qa => ({
            answerOptionId: qa.answerOption.id,
            answer: qa.answerOption.answer,
            category: qa.answerOption.category,
            isCorrect: qa.isCorrect,
            createdBy: qa.answerOption.userId,
            createdOn: qa.answerOption.createdOn
        }))
    }))

    return questionAnswerDefs
}

export async function deleteQuestion(questionId: number) {
  const prisma = new PrismaClient();
  
  try {
    await prisma.$transaction(async (tx) => {
      // Get all questionAnswerMappings for this question
      const questionAnswerMappings = await tx.questionAnswerMappings.findMany({
        where: { questionId: questionId }
      });

      // Delete all test question mappings that reference these questionAnswerMappings
      await tx.testQuestionMappings.deleteMany({
        where: {
          questionAnswerMappingId: {
            in: questionAnswerMappings.map(qam => qam.id)
          }
        }
      });

      // Delete all question answer mappings
      await tx.questionAnswerMappings.deleteMany({
        where: { questionId: questionId }
      });

      // Get and delete all answer options
      const answerOptionIds = questionAnswerMappings.map(qam => qam.answerOptionId);
      await tx.answerOptions.deleteMany({
        where: {
          id: {
            in: answerOptionIds
          }
        }
      });

      // Finally delete the question
      await tx.questions.delete({
        where: { id: questionId }
      });
    });
    
    return true;
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function updateTestQuestionMapping(
  testQuestionMappingAtom: TestQuestionMappingAtom) {
  logger.log('Starting updateTestQuestionMapping')
  const { questionAnswerDefinitions, test } = testQuestionMappingAtom;
  // if(questionAnswerDefinitions && questionAnswerDefinitions.length > 0
  //   && test && test.testId > 0
  // ) {
  if(test && test.testId > 0) {
      questionAnswerDefinitions.forEach(async (qad) => {
        await addOrUpdate(qad, test)
      })
    }
  // }
}

async function addOrUpdate(questionAnswerDefinition: QuestionAnswerDefinitionAtom,
  test: TestDefinitionAtom
) {
  try {
    logger.log('Starting question update/create operation')
    
    const session = await getServerSession()
    const currentUser = await prisma.user.findUnique({
      where: { email: session?.user?.email || '' }
    })
    
    logger.log(`User ${currentUser?.email} performing operation`)

    const currentTimestamp = new Date().toISOString()
  
    // Handle Questions table
    let question
    if (questionAnswerDefinition.question.questionId > 0) {
      question = await prisma.questions.update({
        where: { id: questionAnswerDefinition.question.questionId },
        data: {
          question: questionAnswerDefinition.question.question,
          category: questionAnswerDefinition.question.category,
          type: questionAnswerDefinition.question.type,
          createUserId: currentUser?.id
        }
      })
    } else {
      question = await prisma.questions.create({
        data: {
          question: questionAnswerDefinition.question.question,
          category: questionAnswerDefinition.question.category,
          type: questionAnswerDefinition.question.type,
          createUserId: currentUser?.id,
          createdOn: currentTimestamp
        }
      })
    }

    // Handle AnswerOptions, QuestionAnswerMappings and TestQuestionMappings tables
    await Promise.all(questionAnswerDefinition.answerOptions.map(async (option) => {
          let answerOption
      
          if (option.answerOptionId > 0) {
            answerOption = await prisma.answerOptions.update({
              where: { id: option.answerOptionId },
              data: {
                answer: option.answer,
                category: option.category,
                createUserId: currentUser?.id
              }
            })
          } else {
            answerOption = await prisma.answerOptions.create({
              data: {
                answer: option.answer,
                category: option.category,
                createUserId: currentUser?.id,
                createdOn: currentTimestamp
              }
            })
          }

          // Handle QuestionAnswerMappings
          let questionAnswerMapping = await prisma.questionAnswerMappings.findFirst({
            where: {
              questionId: question.id,
              answerOptionId: answerOption.id
            }
          })
          if(questionAnswerMapping !== null && questionAnswerMapping.id > 0) {
            const qaMs = await prisma.questionAnswerMappings.updateMany({
              where: {
                  questionId: question.id,
                  answerOptionId: answerOption.id
              },
              data: {
                isCorrect: option.isCorrect
              }
            })
          } else {
            questionAnswerMapping = await prisma.questionAnswerMappings.create({
              data: {
                questionId: question.id,
                answerOptionId: answerOption.id,
                isCorrect: option.isCorrect
              }
            })
          }


          // Handle TestQuestionMappings
          const tqMapping = await prisma.testQuestionMappings.findFirst({
            where: {
              testId: test.testId,
              questionAnswerMappingId: questionAnswerMapping.id
            }
          })
          if(tqMapping == null) {
            await prisma.testQuestionMappings.create({
              data: {
                testId: test.testId,
                questionAnswerMappingId: questionAnswerMapping.id,
                sortOrder: 1
              }
            })
          }
    }))
    
    logger.log('Question operation completed successfully')
    return question
  } catch (error) {
    logger.log(`Error in addOrUpdate: ${error}`, 'error')
    throw error
  }
}
