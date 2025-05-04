import { PrismaClient } from '@prisma/client';
import { TestResponseAtom } from '../store/myTestAtom';
import { Logger } from '../utils/logger';

const prisma = new PrismaClient();
const logger = new Logger();

/**
 * Fetches all test responses for a given test ID and formats them as TestResponseAtom objects
 * @param testId The ID of the test to fetch responses for
 * @returns Array of TestResponseAtom objects
 */
export async function getTestResponsesByTestId(testId: number): Promise<TestResponseAtom[]> {
  try {
    logger.info(`Fetching test responses for testId: ${testId}`);
    
    const testResponses = await prisma.testResponse.findMany({
      where: {
        testId: testId,
      },
      include: {
        respondent: {
            include: {
                TestAccessCodes: true
            }
        },
        TestResponseDetails: {
          include: {
            question: true,
            answerOption: true,
          }
        }
      }
    });

    // Get all question answer mappings for this test to check correct answers
    const questionAnswerMappings = await prisma.questionAnswerMappings.findMany({
      where: {
        questionId: {
          in: testResponses.flatMap(response => 
            response.TestResponseDetails.map(detail => detail.questionId)
          )
        },
        isCorrect: true
      },
      select: {
        questionId: true,
        answerOptionId: true
      }
    });

    // Create a map for quick lookup of correct answers
    const correctAnswersMap = new Map();
    questionAnswerMappings.forEach(mapping => {
      correctAnswersMap.set(mapping.questionId, mapping.answerOptionId);
    });

    // Map the Prisma response to TestResponseAtom format
    const formattedResponses: TestResponseAtom[] = testResponses.map(response => ({
      respondent: {
        accessCode: response.respondent.TestAccessCodes[0].code,
        testId: response.testId,
        respondentId: response.respondent.id,
        testAccessId: response.respondent.TestAccessCodes[0].id,
        id: response.respondent.id,
        email: response.respondent.email || '',
        firstName: response.respondent.firstName || '',
        lastName: response.respondent.lastName || ''
        // timeZone: response.respondent.timeZone || '',
      },
      status: response.status,
      startedOn: response.startedOn.toISOString(),
      submittedOn: response.submittedOn?.toISOString() || '',
      score: response.score || 0,
      testResponseDetails: response.TestResponseDetails.map(detail => {
        // Check if the selected answer is correct
        const correctAnswerId = correctAnswersMap.get(detail.questionId);
        const isCorrect = correctAnswerId === detail.answerOptionId;
        
        return {
          testId: response.testId,
          respondentId: response.respondentId,
          id: detail.id,
          questionId: detail.questionId,
          answerOptionId: detail.answerOptionId,
          question: detail.question.question,
          answer: detail.answerOption.answer,
          answeredOn: detail.answeredOn.toISOString(),
          isCorrect: isCorrect
        };
      })
    }));


    logger.info(`Successfully fetched ${formattedResponses.length} test responses for testId: ${testId}`);
    return formattedResponses;
  } catch (error) {
    logger.error(`Error fetching test responses for testId ${testId}: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}
