export interface TestSessionAtom {
    testId: number,
    name: string,
    language: string,
    questionSortOrder: string | undefined,
    testDurationMethod: string | undefined,
    testDurationForTest: string | undefined,
    testDurationForQuestion: string | undefined,
    testActivationMethod: string | undefined,
    manualActivationPeriod: string | undefined,
    scheduledActivationStartsOn: string | undefined,
    scheduledActivationEndsOn: string | undefined,
    createdBy: string | undefined,
    createdOn: string | undefined
}