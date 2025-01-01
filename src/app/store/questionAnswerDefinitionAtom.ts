import { atom } from 'jotai'

export interface QuestionDefinition {
  questionId: number,
  question: string,
  category: string,
  type: string,
  createdBy: string,
  createdOn: string
}

export interface AnswerOptionDefinition {
  answerOptionId: number,
  answer: string,
  category: string,
  isCorrect: boolean,
  createdBy: string,
  createdOn: string
}

export interface QuestionAnswerDefinitionAtom {
  question: QuestionDefinition,
  answerOptions: AnswerOptionDefinition[]
}

export const QuestionAnswerDefinitionState = atom<QuestionAnswerDefinitionAtom | null>(null)