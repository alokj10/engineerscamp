import { atom } from 'jotai'
import { QuestionAnswerDefinitionAtom } from './questionAnswerDefinitionAtom'
import { TestStatus } from '../Constants'

export const testNameAtom = atom('Untitled Test')

export interface TestDefinitionAtom {
    testId: number,
    name: string,
    description: string | undefined,
    category: string,
    language: string,
    status: string | undefined,
    questionSortOrder: string | undefined,
    completionMessage:     string | undefined,
    passingScore:     number | undefined,
    passingScoreUnit:     string | undefined,
    showResults:     boolean | undefined,
    showPassFailMessage:     boolean | undefined,
    showScore:     boolean | undefined,
    showCorrectAnswer:     boolean | undefined,
    passMessage:     string | undefined,
    failMessage:     string | undefined,
    resultRecipients:     string | undefined,
    createdBy: string | undefined,
    createdOn: string | undefined
}

export interface TestRespondentAtom {
  respondentId: number,
  firstName: string,
  lastName: string,
  email: string,
  testId: number,
  accessCode: string,
}

export interface TestQuestionMappingAtom {
    id: number,
    test: TestDefinitionAtom,
    questionAnswerDefinitions: QuestionAnswerDefinitionAtom[],
    testRespondents: TestRespondentAtom[]
}

export const TestQuestionMappingState = atom<TestQuestionMappingAtom | null>(null)


export const currentTestConfigurationAtom = atom<TestQuestionMappingAtom>({
  id: 0,
  test: {
    testId: 0,
    name: 'Untitled Test',
    description: '',
    category: '',
    language: 'English',
    status: TestStatus.Draft,
    questionSortOrder: 'random',
    createdBy: undefined,
    createdOn: undefined
  },
  questionAnswerDefinitions: [],
  testRespondents: []
})
