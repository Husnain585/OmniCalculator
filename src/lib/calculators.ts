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
  Flame,
  Baby,
  PersonStanding,
  Minus,
  Percent,
  Divide,
  FlaskConical,
  Shuffle,
  ArrowRightLeft,
  Footprints,
  Briefcase,
  GitCommit,
  Wrench,
  KeyRound,
} from 'lucide-react';
import BmiCalculator from '@/components/calculators/bmi-calculator';
import SimpleInterestCalculator from '@/components/calculators/simple-interest-calculator';
import DobCalculator from '@/components/calculators/dob-calculator';
import PeriodCalculator from '@/components/calculators/period-calculator';
import ConcreteCalculator from '@/components/calculators/concrete-calculator';
import MortgageCalculator from '@/components/calculators/mortgage-calculator';
import LoanCalculator from '@/components/calculators/loan-calculator';
import RetirementCalculator from '@/components/calculators/retirement-calculator';
import CalorieCalculator from '@/components/calculators/calorie-calculator';
import DueDateCalculator from '@/components/calculators/due-date-calculator';
import BodyFatCalculator from '@/components/calculators/body-fat-calculator';
import BmrCalculator from '@/components/calculators/bmr-calculator';
import PercentageCalculator from '@/components/calculators/percentage-calculator';
import FractionCalculator from '@/components/calculators/fraction-calculator';
import ScientificCalculator from '@/components/calculators/scientific-calculator';
import RandomNumberGenerator from '@/components/calculators/random-number-generator';
import CurrencyConverter from '@/components/calculators/currency-converter';
import InvestmentCalculator from '@/components/calculators/investment-calculator';
import PaceCalculator from '@/components/calculators/pace-calculator';
import GcdCalculator from '@/components/calculators/gcd-calculator';
import IdealWeightCalculator from '@/components/calculators/ideal-weight-calculator';
import SalesTaxCalculator from '@/components/calculators/sales-tax-calculator';
import PasswordGenerator from '@/components/calculators/password-generator';
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
        name: 'Investment Calculator',
        slug: 'investment-calculator',
        description: 'Project the growth of your investments over time.',
        component: InvestmentCalculator,
        icon: Briefcase,
      },
      {
        name: 'Retirement Calculator',
        slug: 'retirement-calculator',
        description: 'Plan and estimate your retirement savings.',
        component: RetirementCalculator,
        icon: CalendarClock,
      },
      {
        name: 'USD to PKR Converter',
        slug: 'usd-to-pkr-converter',
        description: 'Convert US Dollars to Pakistani Rupees.',
        component: CurrencyConverter,
        icon: ArrowRightLeft,
      },
      {
        name: 'Sales Tax Calculator',
        slug: 'sales-tax-calculator',
        description: 'Quickly calculate sales tax and total price.',
        component: SalesTaxCalculator,
        icon: Receipt,
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
      {
        name: 'Calorie Calculator',
        slug: 'calorie-calculator',
        description:
          'Estimate your daily calorie needs for maintenance or weight loss.',
        component: CalorieCalculator,
        icon: Flame,
      },
      {
        name: 'Due Date Calculator',
        slug: 'due-date-calculator',
        description: 'Estimate your pregnancy due date.',
        component: DueDateCalculator,
        icon: Baby,
      },
      {
        name: 'Body Fat Calculator',
        slug: 'body-fat-calculator',
        description:
          'Estimate your body fat percentage using the U.S. Navy method.',
        component: BodyFatCalculator,
        icon: PersonStanding,
      },
      {
        name: 'BMR Calculator',
        slug: 'bmr-calculator',
        description: 'Calculate your Basal Metabolic Rate (BMR).',
        component: BmrCalculator,
        icon: Minus,
      },
      {
        name: 'Ideal Weight Calculator',
        slug: 'ideal-weight-calculator',
        description: 'Find your ideal weight based on height and gender.',
        component: IdealWeightCalculator,
        icon: Dumbbell,
      },
    ],
  },
  {
    name: 'Math',
    slug: 'math',
    description: 'Solve mathematical problems from basic to advanced.',
    icon: Sigma,
    calculators: [
      {
        name: 'Percentage Calculator',
        slug: 'percentage-calculator',
        description: 'Calculate percentages for various scenarios.',
        component: PercentageCalculator,
        icon: Percent,
      },
      {
        name: 'Fraction Calculator',
        slug: 'fraction-calculator',
        description: 'Add, subtract, multiply, and divide fractions.',
        component: FractionCalculator,
        icon: Divide,
      },
      {
        name: 'Scientific Calculator',
        slug: 'scientific-calculator',
        description:
          'A powerful calculator for scientific and engineering calculations.',
        component: ScientificCalculator,
        icon: FlaskConical,
      },
      {
        name: 'Random Number Generator',
        slug: 'random-number-generator',
        description: 'Generate a random number within a specified range.',
        component: RandomNumberGenerator,
        icon: Shuffle,
      },
      {
        name: 'GCD Calculator',
        slug: 'gcd-calculator',
        description: 'Find the Greatest Common Divisor of two integers.',
        component: GcdCalculator,
        icon: GitCommit,
      },
    ],
  },
  {
    name: 'Fitness',
    slug: 'fitness',
    description: 'Track your fitness goals and progress.',
    icon: Dumbbell,
    calculators: [
      {
        name: 'Pace Calculator',
        slug: 'pace-calculator',
        description: 'Calculate your running pace, time, or distance.',
        component: PaceCalculator,
        icon: Footprints,
      },
    ],
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
    name: 'Utilities',
    slug: 'utilities',
    description: 'Handy tools for various everyday tasks.',
    icon: Wrench,
    calculators: [
      {
        name: 'Password Generator',
        slug: 'password-generator',
        description: 'Create strong, random passwords to enhance your security.',
        component: PasswordGenerator,
        icon: KeyRound,
      }
    ]
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