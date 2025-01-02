'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { Editor, EditorState, ContentState, RichUtils, convertToRaw, convertFromRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { toast } from 'react-hot-toast'
import { QuestionAnswerDefinitionAtom } from '@/app/store/questionAnswerDefinitionAtom'
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const StyleButton = ({ onToggle, active, label, style }) => {
  return (
    <button
      className={`px-3 py-1 mr-2 rounded ${active ? 'bg-gray-700 text-white' : 'bg-gray-200'}`}
      onMouseDown={(e) => {
        e.preventDefault();
        onToggle(style);
      }}
    >
      {label}
    </button>
  );
};

const RichTextEditor = ({ editorState, onChange }) => {
  const handleKeyCommand = useCallback((command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      onChange(newState);
      return 'handled';
    }
    return 'not-handled';
  }, [onChange]);

  const toggleInlineStyle = (inlineStyle) => {
    onChange(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  };

  const toggleBlockType = (blockType) => {
    onChange(RichUtils.toggleBlockType(editorState, blockType));
  };

  return (
    <div className="border rounded-md p-4">
      <div className="mb-2 flex flex-wrap gap-1">
        <StyleButton
          label="Bold"
          onToggle={toggleInlineStyle}
          active={editorState.getCurrentInlineStyle().has('BOLD')}
          style="BOLD"
        />
        <StyleButton
          label="Code"
          onToggle={toggleBlockType}
          active={RichUtils.getCurrentBlockType(editorState) === 'code-block'}
          style="code-block"
        />
      </div>
      <div className="border p-2 min-h-[100px]">
        <Editor
          editorState={editorState}
          onChange={onChange}
          handleKeyCommand={handleKeyCommand}
        />
      </div>
    </div>
  );
};

type QuestionType = 'Single Choice' | 'Multiple Choice' | 'Descriptive' | 'Short Answer' | 'Survey' | 'True False';
type Category = 'Programming' | 'Technology' | 'Academic';

interface AnswerOption {
    content: EditorState;
    isCorrect: boolean;
}

interface QuestionForm {
    question: EditorState;
    category: Category;
    type: QuestionType;
    options: AnswerOption[];
}

const questionSchema = z.object({
    question: z.custom((val) => {
      const editorState = val as EditorState;
      return editorState.getCurrentContent().hasText();
    }, "Question is required"),
    category: z.enum(['Programming', 'Technology', 'Academic'], {
      required_error: "Category is required"
    }),
    type: z.enum(['Single Choice', 'Multiple Choice', 'Descriptive', 'Short Answer', 'Survey', 'True False'], {
      required_error: "Question type is required"
    }),
    options: z.array(z.object({
      content: z.custom((val) => {
        const editorState = val as EditorState;
        return editorState.getCurrentContent().hasText();
      }, "Answer option content is required"),
      isCorrect: z.boolean()
    })).refine((options) => {
      const type = useWatch({ name: 'type' });
    
      if (type === 'Single Choice' || type === 'Survey') {
        return options.length >= 2 && options.every(opt => opt.content.getCurrentContent().hasText());
      }
    
      if (type === 'Multiple Choice') {
        return options.length >= 3 && options.every(opt => opt.content.getCurrentContent().hasText());
      }
    
      if (type === 'True False') {
        return options.length === 2;
      }
    
      return true;
    }, {
      message: "Invalid number of options for selected question type"
    })
});

export default function AddQuestion() {
    const router = useRouter();
    const { control, watch, handleSubmit } = useForm<QuestionForm>({
      resolver: zodResolver(questionSchema),
      defaultValues: {
        question: EditorState.createEmpty(),
        category: 'Programming',
        type: 'Single Choice',
        options: [
          { content: EditorState.createEmpty(), isCorrect: false },
          { content: EditorState.createEmpty(), isCorrect: false }
        ]
      }
    });
    const { setValue } = useForm<QuestionForm>();

    const questionType = watch('type');

    const getMinOptions = (type: QuestionType) => {
      switch (type) {
        case 'Single Choice': return 2;
        case 'Multiple Choice': return 3;
        case 'True False': return 2;
        case 'Survey': return 2;
        default: return 1;
      }
    };
  
    const onSubmit = async (data: QuestionForm) => {
      try {
        const formattedData = {
            ...data,
            question: convertToRaw(data.question.getCurrentContent()),
            options: data.options.map(option => ({
                ...option,
                content: convertToRaw(option.content.getCurrentContent())
            }))
        }
  
        const questionAnswerDef: QuestionAnswerDefinitionAtom = {
            question: {
                questionId: 0,
                question: JSON.stringify(formattedData.question),
                category: formattedData.category,
                type: formattedData.type,
                createdBy: '',
                createdOn: ''
            },
            answerOptions: formattedData.options.map((option, index) => ({
                answerOptionId: 0,
                answer: JSON.stringify(option.content),
                category: formattedData.category,
                isCorrect: option.isCorrect,
                createdBy: '',
                createdOn: ''
            }))
        }
  
        const response = await fetch('/api/mytests/questionsmanager', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(questionAnswerDef)
        })
  
        if (response.ok) {
            toast.success('Question added successfully')
            router.push('/mytests/questionsmanager')
            router.refresh()
        } else {
            const error = await response.json()
            toast.error(error.message || 'Failed to add question')
        }
      } catch (error: any) {
        toast.error(error.message);
      }
    }

    const onError = (errors: any) => {
      if (errors.question) {
        toast.error('Please enter a question');
        return;
      }
      if (errors.category) {
        toast.error('Please select a category');
        return;
      }
      if (errors.type) {
        toast.error('Please select a question type');
        return;
      }
      if (errors.options) {
        const type = watch('type');
        switch(type) {
          case 'Single Choice':
          case 'Survey':
            toast.error('Please provide at least 2 answer options with content');
            break;
          case 'Multiple Choice':
            toast.error('Please provide at least 3 answer options with content');
            break;
          case 'True False':
            toast.error('True/False question must have exactly 2 options');
            break;
          default:
            toast.error('Please check answer options');
        }
        return;
      }
    };
    

    useEffect(() => {
      const type = watch('type');
      if (type === 'True False') {
        const trueState = EditorState.createWithContent(ContentState.createFromText('True'));
        const falseState = EditorState.createWithContent(ContentState.createFromText('False'));
        setValue('options', [
          { content: trueState, isCorrect: false },
          { content: falseState, isCorrect: false }
        ]);
      }
    }, [watch('type')]);
    
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold">Add New Question</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
        <div className="space-y-4">
          <label className="block text-sm font-medium">Question</label>
          <Controller
            name="question"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                editorState={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <select {...field} className="w-full p-2 border rounded-md">
                  <option value="Programming">Programming</option>
                  <option value="Technology">Technology</option>
                  <option value="Academic">Academic</option>
                </select>
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Question Type</label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <select {...field} className="w-full p-2 border rounded-md">
                  <option value="Single Choice">Single Choice</option>
                  <option value="Multiple Choice">Multiple Choice</option>
                  <option value="Descriptive">Descriptive</option>
                  <option value="Short Answer">Short Answer</option>
                  <option value="Survey">Survey</option>
                  <option value="True False">True False</option>
                </select>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium">Answer Options</label>
          <Controller
            name="options"
            control={control}
            render={({ field }) => (
              <div className="space-y-4">
                {Array.from({ length: getMinOptions(questionType) }).map((_, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-grow">
                      <RichTextEditor
                        editorState={field.value[index]?.content || EditorState.createEmpty()}
                        onChange={(newEditorState) => {
                          const newOptions = [...field.value];
                          newOptions[index] = { ...newOptions[index], content: newEditorState };
                          field.onChange(newOptions);
                        }}
                      />
                    </div>
                    {['Single Choice', 'Multiple Choice'].includes(questionType) && (
                      <div className="mt-2">
                        <input
                          type={questionType === 'Single Choice' ? 'radio' : 'checkbox'}
                          checked={field.value[index]?.isCorrect || false}
                          onChange={(e) => {
                            const newOptions = [...field.value];
                            if (questionType === 'Single Choice') {
                              newOptions.forEach(opt => opt.isCorrect = false);
                            }
                            newOptions[index] = { ...newOptions[index], isCorrect: e.target.checked };
                            field.onChange(newOptions);
                          }}
                          className="w-4 h-4"
                        />
                      </div>
                    )}
                  </div>
                ))}
                
                {['Single Choice', 'Multiple Choice', 'Survey'].includes(questionType) && (
                  <button
                    type="button"
                    onClick={() => {
                      const newOptions = [...field.value];
                      newOptions.push({ content: EditorState.createEmpty(), isCorrect: false });
                      field.onChange(newOptions);
                    }}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mt-4"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Option
                  </button>
                )}
              </div>
            )}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Save Question
        </button>
      </form>
    </div>
  );
}
