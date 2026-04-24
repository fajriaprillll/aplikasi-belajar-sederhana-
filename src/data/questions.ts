import { grade1Data } from "./grades/grade1";
import { grade2Data } from "./grades/grade2";
import { grade3Data } from "./grades/grade3";
import { grade4Data } from "./grades/grade4";
import { grade5Data } from "./grades/grade5";
import { grade6Data } from "./grades/grade6";

export type QuestionType = 'multiple-choice' | 'essay';

export type Question = {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  answer: string;
};

export type SubjectData = Record<string, Question[]>;
export type GradeData = Record<string, SubjectData>;

export const quizData: GradeData = {
  grade1: grade1Data,
  grade2: grade2Data,
  grade3: grade3Data,
  grade4: grade4Data,
  grade5: grade5Data,
  grade6: grade6Data
};
