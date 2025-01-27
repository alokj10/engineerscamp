'use server'

import { TestAccessCodes } from "@prisma/client";
import prisma from "../lib/prisma";
import { TestRespondentAtom } from "../store/myTestAtom";
import { getRespondentDetailsByAccessCode } from "./testActions";
import { logger } from "../utils/logger";

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
        testId: testId,
        respondentId: respondentId,
        firstName: testAccessRow.respondent.firstName || '',
        lastName: testAccessRow.respondent.lastName || '',
        email: testAccessRow.respondent.email || '',
        accessCode: '',
    };

    return respondent;
}