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
    name: string,
    language: string,
    questionSortOrder: string | undefined,
    testDurationMethod: string | undefined,
    testDurationForTest: string | undefined,
    testDurationForQuestion: string | undefined,
    questionAnswers: QzQuestionAnswerAtom[]
}