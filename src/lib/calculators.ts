import type { LucideIcon } from 'lucide-react';
import {
  PiggyBank,
  HeartPulse,
  Sigma,
  Dumbbell,
  HardHat,
  FunctionSquare,
  Calculator as CalculatorIcon,
  Cake,
  Droplets,
  Building,
  Home,
  Landmark,
  Car,
  TrendingUp,
  LineChart,
  CalendarClock,
  Wallet,
  AreaChart,
  Receipt,
} from 'lucide-react';
import BmiCalculator from '@/components/calculators/bmi-calculator';
import SimpleInterestCalculator from '@/components/calculators/simple-interest-calculator';
import DobCalculator from '@/components/calculators/dob-calculator';
import PeriodCalculator from '@/components/calculators/period-calculator';
import ConcreteCalculator from '@/components/calculators/concrete-calculator';
import MortgageCalculator from '@/components/calculators/mortgage-calculator';
import LoanCalculator from '@/components/calculators/loan-calculator';
import RetirementCalculator from '@/components/calculators/retirement-calculator';
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
}

export const calculatorCategories: CalculatorCategory[] = [
  {
    name: 'Finance',
    slug: 'finance',
    description: 'Calculators for loans, investments, and savings.',
    icon: PiggyBank,
    calculators: [
      {
        name: 'Simple Interest',
        slug: 'simple-interest',
        description: 'Calculate simple interest on a loan or investment.',
        component: SimpleInterestCalculator,
        icon: CalculatorIcon,
      },
      {
        name: 'Mortgage Calculator',
        slug: 'mortgage-calculator',
        description: 'Estimate your monthly mortgage payments.',
        component: MortgageCalculator,
        icon: Home,
      },
      {
        name: 'Loan Calculator',
        slug: 'loan-calculator',
        description: 'Calculate payments for any type of loan.',
        component: LoanCalculator,
        icon: Landmark,
      },
      {
        name: 'Retirement Calculator',
        slug: 'retirement-calculator',
        description: 'Plan and estimate your retirement savings.',
        component: RetirementCalculator,
        icon: CalendarClock,
      },
    ],
  },
  {
    name: 'Health',
    slug: 'health',
    description: 'Monitor your health and wellness with these tools.',
    icon: HeartPulse,
    calculators: [
      {
        name: 'BMI Calculator',
        slug: 'bmi-calculator',
        description: 'Calculate your Body Mass Index.',
        component: BmiCalculator,
        icon: CalculatorIcon,
      },
      {
        name: 'Period & Ovulation',
        slug: 'period-calculator',
        description: 'Estimate your next period and fertile window.',
        component: PeriodCalculator,
        icon: Droplets,
      },
    ],
  },
  {
    name: 'Math',
    slug: 'math',
    description: 'Solve mathematical problems from basic to advanced.',
    icon: Sigma,
    calculators: [],
  },
  {
    name: 'Fitness',
    slug: 'fitness',
    description: 'Track your fitness goals and progress.',
    icon: Dumbbell,
    calculators: [],
  },
  {
    name: 'Construction',
    slug: 'construction',
    description: 'Calculators for building and construction projects.',
    icon: HardHat,
    calculators: [
      {
        name: 'Concrete Calculator',
        slug: 'concrete-calculator',
        description: 'Estimate the volume of concrete needed for a project.',
        component: ConcreteCalculator,
        icon: Building,
      },
    ],
  },
  {
    name: 'Other',
    slug: 'other',
    description: 'A collection of other useful calculators.',
    icon: FunctionSquare,
    calculators: [
      {
        name: 'Date of Birth',
        slug: 'dob-calculator',
        description: 'Calculate your age and see details about your birthday.',
        component: DobCalculator,
        icon: Cake,
      },
    ],
  },
];

export const allCalculators: Calculator[] = calculatorCategories.flatMap(
  (category) => category.calculators
);
