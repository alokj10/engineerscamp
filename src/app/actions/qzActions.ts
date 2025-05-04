'use server'

import { TestAccessCodes } from "@prisma/client";
import prisma from "../lib/prisma";
import { TestRespondentAtom } from "../store/myTestAtom";
import { getRespondentDetailsByAccessCode } from "./testActions";
import { logger } from "../utils/logger";
import { QzQuestionAnswerAtom, QzResponseAtom, QzSessionAtom } from "../store/qzAtom";
import { getIsoDateTimeString } from "../utils/dateTimeUtils";

export async function getRespondentInfoForSession(testRespondentAtom: TestRespondentAtom): Promise<TestRespondentAtom> {
      const decodeResult = await getRespondentDetailsByAccessCode(testRespondentAtom.accessCode);
      if(decodeResult && 
          decodeResult.testId > 0 &&
          decodeResult.respondentId > 0
      ) {
          return await getRespondentDetails(
              decodeResult.testId,
              decodeResult.respondentId,
              decodeResult.timestamp,
              testRespondentAtom.email
          );
      }
      else {
          throw new Error('Invalid access code');
      }
}

export async function getRespondentDetails(testId: number, 
      respondentId: number, 
      timestamp: string,
      email: string): Promise<TestRespondentAtom> {
      const testAccessRows = await prisma.testAccessCodes.findMany({
          where: {
              testId: testId,
              respondentId: respondentId,
              timestamp: timestamp,
              test: {
                  status: 'ACTIVE'
              },
              respondent: {
                  email: email
              }
          },
          include: {
              respondent: true
          }
      });

      if(testAccessRows.length === 0) {
          logger.error(`No test found for: testId=${testId}, respondentId=${respondentId}, timestamp=${timestamp}`);
          throw new Error('No test found for the given access code/email. Test may have ended or access code is invalid.');
      }

      if(testAccessRows.length > 1) {
          logger.error(`Multiple tests (${testAccessRows.length}) found for: testId=${testId}, respondentId=${respondentId}, timestamp=${timestamp}`);
          throw new Error("Multiple test access records found for the same respondent.");
      }

      const testAccessRow = testAccessRows[0];
      const respondent: TestRespondentAtom = {
          testAccessId: testAccessRow.id,
          testId: testId,
          respondentId: respondentId,
          firstName: testAccessRow.respondent.firstName || '',
          lastName: testAccessRow.respondent.lastName || '',
          email: testAccessRow.respondent.email || '',
          accessCode: '',
      };


      return respondent;
}

export async function getDataForQzSession(testAccessId: number): Promise<QzSessionAtom> {
      const testAccessRow = await prisma.testAccessCodes.findUnique({
          where: {
              id: testAccessId
          },
          include: {
              test: {
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
              }
          }
      });

      if (!testAccessRow || !testAccessRow.test) {
          throw new Error('Test session not found');
      }

      // Group mappings by questionId
      const questionMap = new Map<number, QzQuestionAnswerAtom>();
      testAccessRow.test.testQuestionMappings.forEach(mapping => {
          const qa = mapping.questionAnswerMapping;
          const questionId = qa.question.id;

          if (!questionMap.has(questionId)) {
              // Create new question answer entry if it doesn't exist
              questionMap.set(questionId, {
                  question: {
                      questionId: questionId,
                      question: qa.question.question,
                      type: qa.question.type
                  },
                  answerOptions: []
              });
          }

          // Add the answer option to the existing question
          questionMap.get(questionId)?.answerOptions.push({
              answerOptionId: qa.answerOption.id,
              answer: qa.answerOption.answer,
              isSelected: false
          });
      });
    
      // Convert map to array
      const questionAnswers: QzQuestionAnswerAtom[] = Array.from(questionMap.values());

      return {
          testId: testAccessRow.testId,
          respondentId: testAccessRow.respondentId,
          name: testAccessRow.test.name,
          language: 'English',
          questionSortOrder: testAccessRow.test.questionSortOrder,
          testDurationMethod: testAccessRow.test.testDurationMethod || 'complete',
          testDurationForTest: testAccessRow.test.testDurationForTest || '00:30',
          testDurationForQuestion: testAccessRow.test.testDurationForQuestion || '00:02',
          questionAnswers: questionAnswers
      };
}

export async function saveResponse(data: QzResponseAtom) {
    try {
      // First, check if a TestResponse record already exists
      let testResponse = await prisma.testResponse.findFirst({
        where: {
          testId: data.testId,
          respondentId: data.respondentId
        }
      });

      // If no record exists, create a new one
      if (!testResponse) {
        testResponse = await prisma.testResponse.create({
          data: {
            testId: data.testId,
            respondentId: data.respondentId,
            startedOn: getIsoDateTimeString(),
            status: data.status
          }
        });
        logger.info(`Created new TestResponse with ID: ${testResponse.id}`);
      } else {
        // If record exists, update it (keeping startedOn unchanged)
        testResponse = await prisma.testResponse.update({
          where: {
            id: testResponse.id
          },
          data: {
            status: data.status,
            updatedOn: getIsoDateTimeString()
          }
        });
        logger.info(`Updated existing TestResponse with ID: ${testResponse.id}`);
      }

      // Process each question answer
      for (const qa of data.questionAnswers) {
        // Check if a TestResponseDetails record already exists for this question
        const existingDetail = await prisma.testResponseDetails.findFirst({
          where: {
            testResponseId: testResponse.id,
            questionId: qa.questionId
          }
        });

        if (existingDetail) {
          // Update existing record
          await prisma.testResponseDetails.update({
            where: {
              id: existingDetail.id
            },
            data: {
              answerOptionId: qa.answerOptionIds[0],
              answeredOn: getIsoDateTimeString()
            }
          });
          logger.info(`Updated TestResponseDetails for question ID: ${qa.questionId}`);
        } else {
          // Create new record
          await prisma.testResponseDetails.create({
            data: {
              testResponseId: testResponse.id,
              questionId: qa.questionId,
              answerOptionId: qa.answerOptionIds[0],
              answeredOn: getIsoDateTimeString()
            }
          });
          logger.info(`Created TestResponseDetails for question ID: ${qa.questionId}`);
        }





      }

      return { testResponseId: testResponse.id };
    } catch (error) {
      logger.error(`Error in saveResponse: ${error}`);
      throw error;
    }
}

export async function calculateAndUpdateScore(testId: number, respondentId: number): Promise<{ success: boolean, score: number }> {
  try {
    // Get the TestResponse record
    const testResponse = await prisma.testResponse.findFirst({
      where: {
        testId: testId,
        respondentId: respondentId
      }
    });

    if (!testResponse) {
      logger.error(`No test response found for testId=${testId}, respondentId=${respondentId}`);
      throw new Error('No test response found');
    }
    logger.info(`Found test response with id=${testResponse.id}`);

    // Get all response details for this test response
    const responseDetails = await prisma.testResponseDetails.findMany({
      where: {
        testResponseId: testResponse.id
      }
    });

    if (responseDetails.length === 0) {
      logger.warning(`No response details found for testResponseId=${testResponse.id}`);
      return { success: true, score: 0 };
    }

    let totalScore = 0;
    const scorePerCorrectAnswer = 10;

    // Check each answer against the correct answers
    for (const detail of responseDetails) {
      // Find if this answer is correct using QuestionAnswerMappings
      const correctAnswer = await prisma.questionAnswerMappings.findFirst({
        where: {
          questionId: detail.questionId,
          answerOptionId: detail.answerOptionId,
          isCorrect: true
        }
      });

      if (correctAnswer) {
        totalScore += scorePerCorrectAnswer;
        logger.info(`Correct answer for questionId=${detail.questionId}, adding ${scorePerCorrectAnswer} points`);
      }
    }

    // Update the TestResponse with the calculated score
    await prisma.testResponse.update({
      where: {
        id: testResponse.id
      },
      data: {
        score: totalScore,
        submittedOn: getIsoDateTimeString(),
        updatedOn: getIsoDateTimeString(),
        status: 'COMPLETED'
      }
    });

    logger.info(`Updated score for testResponseId=${testResponse.id} to ${totalScore}`);
    return { success: true, score: totalScore };
  } catch (error) {
    logger.error(`Error in calculateAndUpdateScore: ${error}`);
    throw error;
  }
}