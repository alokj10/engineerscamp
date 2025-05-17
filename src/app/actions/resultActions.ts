import { PrismaClient } from '@prisma/client';
import { TestResponseAtom, TestResultStatisticsAtom } from '../store/myTestAtom';
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

/**
 * Calculates statistics for a given test ID
 * @param testId The ID of the test to calculate statistics for
 * @returns TestResultStatisticsAtom object containing statistics
 */
export async function getTestStatistics(testId: number): Promise<TestResultStatisticsAtom> {
  try {
    logger.info(`Calculating statistics for testId: ${testId}`);
    
    // Get all test responses for the given test ID
    const testResponses = await getTestResponsesByTestId(testId);
    
    // Calculate respondents count
    const respondentsCount = testResponses.length;
    
    // Calculate passed and failed counts based on score threshold of 60
    const passedCount = testResponses.filter(response => response.score >= 60).length;
    const failedCount = testResponses.filter(response => response.score < 60).length;
    
    // Calculate average completion time
    let totalCompletionTimeMs = 0;
    let completedResponsesCount = 0;
    
    testResponses.forEach(response => {
      if (response.submittedOn) {
        const startTime = new Date(response.startedOn).getTime();
        const endTime = new Date(response.submittedOn).getTime();
        const completionTimeMs = endTime - startTime;
        
        if (completionTimeMs > 0) {
          totalCompletionTimeMs += completionTimeMs;
          completedResponsesCount++;
        }
      }
    });
    
    // Calculate average completion time in seconds
    const avgCompletionTimeSeconds = completedResponsesCount > 0 
      ? Math.round(totalCompletionTimeMs / completedResponsesCount / 1000) 
      : 0;
    
    // Format the average completion time as a string
    let avgCompletionTime = "0m";
    if (avgCompletionTimeSeconds > 0) {
      const minutes = Math.floor(avgCompletionTimeSeconds / 60);
      const seconds = avgCompletionTimeSeconds % 60;
      
      if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        avgCompletionTime = `${hours}h ${remainingMinutes}m`;
      } else {
        avgCompletionTime = `${minutes}m ${seconds}s`;
      }
    }
    
    const statistics: TestResultStatisticsAtom = {
      testId,
      respondentsCount,
      passedCount,
      failedCount,
      avgCompletionTime
    };
    
    logger.info(`Successfully calculated statistics for testId: ${testId}`);
    return statistics;
  } catch (error) {
    logger.error(`Error calculating statistics for testId ${testId}: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}
