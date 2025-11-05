import type { LucideIcon } from 'lucide-react';
import {
  PiggyBank,
  HeartPulse,
  Sigma,
  Dumbbell,
  HardHat,
  FunctionSquare,
  Calculator as CalculatorIcon,
} from 'lucide-react';
import BmiCalculator from '@/components/calculators/bmi-calculator';
import SimpleInterestCalculator from '@/components/calculators/simple-interest-calculator';
import type { ComponentType } from 'react';

export interface Calculator {
  name: string;
  slug: string;
  description: string;
  component: ComponentType;
  icon: LucideIcon;
}

export interface CalculatorCategory {
  name: string;
  slug: string;
  description: string;
  icon: LucideIcon;
  calculators: Calculator[];
  image: {
    id: string;
    hint: string;
  };
}

export const calculatorCategories: CalculatorCategory[] = [
  {
    name: 'Finance',
    slug: 'finance',
    description: 'Calculators for loans, investments, and savings.',
    icon: PiggyBank,
    image: { id: 'finance', hint: 'money charts' },
    calculators: [
      {
        name: 'Simple Interest',
        slug: 'simple-interest',
        description: 'Calculate simple interest on a loan or investment.',
        component: SimpleInterestCalculator,
        icon: CalculatorIcon,
      },
    ],
  },
  {
    name: 'Health',
    slug: 'health',
    description: 'Monitor your health and wellness with these tools.',
    icon: HeartPulse,
    image: { id: 'health', hint: 'health medical' },
    calculators: [
      {
        name: 'BMI Calculator',
        slug: 'bmi-calculator',
        description: 'Calculate your Body Mass Index.',
        component: BmiCalculator,
        icon: CalculatorIcon,
      },
    ],
  },
  {
    name: 'Math',
    slug: 'math',
    description: 'Solve mathematical problems from basic to advanced.',
    icon: Sigma,
    image: { id: 'math', hint: 'mathematics equations' },
    calculators: [],
  },
  {
    name: 'Fitness',
    slug: 'fitness',
    description: 'Track your fitness goals and progress.',
    icon: Dumbbell,
    image: { id: 'fitness', hint: 'gym workout' },
    calculators: [],
  },
  {
    name: 'Construction',
    slug: 'construction',
    description: 'Calculators for building and construction projects.',
    icon: HardHat,
    image: { id: 'construction', hint: 'construction site' },
    calculators: [],
  },
  {
    name: 'Other',
    slug: 'other',
    description: 'A collection of other useful calculators.',
    icon: FunctionSquare,
    image: { id: 'other', hint: 'abstract tools' },
    calculators: [],
  },
];

export const allCalculators: Calculator[] = calculatorCategories.flatMap(
  (category) => category.calculators
);
