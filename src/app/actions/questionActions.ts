'use server'
import { PrismaClient } from "@prisma/client"
import { QuestionAnswerDefinitionAtom } from "../store/questionAnswerDefinitionAtom"
import { getServerSession } from "next-auth"

const prisma = new PrismaClient()

export async function createQuestionAnswer(questionAnswerDef: QuestionAnswerDefinitionAtom) {
    const session = await getServerSession()
    const currentUser = await prisma.user.findUnique({
        where: { email: session?.user?.email || '' }
    })

    if (!currentUser) {
        throw new Error('Unauthorized: Only admin users can create questions')
    }

    const currentTimestamp = new Date().toISOString()

    const question = await prisma.questions.create({
        data: {
            question: questionAnswerDef.question.question,
            category: questionAnswerDef.question.category,
            type: questionAnswerDef.question.type,
            userId: currentUser.id,
            createdOn: currentTimestamp
        }
    })

    const answerOptions = await Promise.all(
        questionAnswerDef.answerOptions.map(async (option) => {
            const answerOption = await prisma.answerOptions.create({
                data: {
                    answer: option.answer,
                    category: question.category,
                    userId: currentUser.id,
                    createdOn: currentTimestamp
                }
            })

            await prisma.questionAnswers.create({
                data: {
                    questionId: question.id,
                    answerOptionId: answerOption.id,
                    isCorrect: option.isCorrect
                }
            })

            return answerOption
        })
    )

    return {
        question,
        answerOptions
    }
}

export async function getQuestionsByCategory(userId: number, category?: string) {
    const questions = await prisma.questions.findMany({
        where: {
            userId: userId,
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
      // Get answer option IDs that are referenced in questionanswers
      const answerOptionIds = await tx.questionAnswers.findMany({
        where: { questionId: questionId },
        select: { answerOptionId: true }
      });
      

      // Delete question answers
      await tx.questionAnswers.deleteMany({
        where: { questionId: questionId }
      });
      
      // Delete specific answer options that are referenced
      await tx.answerOptions.deleteMany({
        where: {
          id: {
            in: answerOptionIds.map(ao => ao.answerOptionId)
          }
        }
      });
      
      // Delete the question
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