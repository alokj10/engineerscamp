import { atom } from 'jotai'
import { QuestionAnswerDefinitionAtom } from './questionAnswerDefinitionAtom'

export const testNameAtom = atom('Untitled Test')

export interface TestDefinitionAtom {
    testId: number,
    name: string,
    description: string,
    category: string,
    status: string,
    questionSortOrder: string,
    createdBy: string,
    createdOn: string
}

export interface TestQuestionMappingAtom {
    id: number,
    test: TestDefinitionAtom,
    questionAnswerDefinitions: QuestionAnswerDefinitionAtom[]
}

export const TestQuestionMappingState = atom<TestQuestionMappingAtom | null>(null)