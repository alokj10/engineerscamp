export interface QzQuestionAtom {
    questionId: number,
    question: string,
    type: string
}

export interface QzAnswerOptionAtom {
    answerOptionId: number,
    answer: string,
    isSelected: boolean
}

export interface QzQuestionAnswerAtom {
    question: QzQuestionAtom,
    answerOptions: QzAnswerOptionAtom[]
}

export interface QzSessionAtom {
    testId: number,
    respondentId: number,
    name: string,
    language: string,
    questionSortOrder: string | undefined,
    testDurationMethod: string | undefined,
    testDurationForTest: string | undefined,
    testDurationForQuestion: string | undefined,
    questionAnswers: QzQuestionAnswerAtom[]
}

export interface QzResponseQuestionAnswerAtom {
    questionId: number,
    answerOptionIds: number[],
    answeredOn: string,
}

export interface QzResponseAtom {
    testId: number,
    respondentId: number,
    status: string,
    questionAnswers: QzResponseQuestionAnswerAtom[]
}