import { grade1Data } from "./grades/grade1";
import { grade2Data } from "./grades/grade2";
import { grade3Data } from "./grades/grade3";
import { grade4Data } from "./grades/grade4";
import { grade5Data } from "./grades/grade5";
import { grade6Data } from "./grades/grade6";
import { uasData } from "./grades/uasData";

export type QuestionType = 'multiple-choice' | 'essay';

export type Question = {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  answer: string;
  difficulty?: 'mudah' | 'sedang' | 'sulit';
  category?: 'latihan' | 'uas';
  explanation?: string;
};

export type SubjectData = Record<string, Question[]>;
export type GradeData = Record<string, SubjectData>;

export const quizData: GradeData = {
  grade1: { ...grade1Data, ...uasData.grade1 },
  grade2: { ...grade2Data, ...uasData.grade2 },
  grade3: { ...grade3Data, ...uasData.grade3 },
  grade4: { ...grade4Data, ...uasData.grade4 },
  grade5: { ...grade5Data, ...uasData.grade5 },
  grade6: { ...grade6Data, ...uasData.grade6 }
};
