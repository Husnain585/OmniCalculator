"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calculator as CalculatorIcon, Lightbulb } from 'lucide-react';
import { suggestNextStep } from '@/ai/flows/suggest-next-step';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  initialInvestment: z.coerce.number().min(0, 'Initial investment cannot be negative'),
  monthlyContribution: z.coerce.number().min(0, 'Monthly contribution cannot be negative'),
  annualReturn: z.coerce.number().min(0, 'Expected return cannot be negative'),
  years: z.coerce.number().int().positive('Years must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
  futureValue: number;
  totalContributions: number;
  totalInterest: number;
}

export default function InvestmentCalculator() {
  const [result, setResult] = useState<Result | null>(null);
  const [suggestion, setSuggestion] = useState('');
  const [suggestionLoading, setSuggestionLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        annualReturn: 7,
    }
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { initialInvestment, monthlyContribution, annualReturn, years } = data;
    const monthlyReturnRate = annualReturn / 100 / 12;
    const numberOfMonths = years * 12;

    const futureValueOfInitial = initialInvestment * Math.pow(1 + monthlyReturnRate, numberOfMonths);
    const futureValueOfContributions = monthlyContribution * ((Math.pow(1 + monthlyReturnRate, numberOfMonths) - 1) / monthlyReturnRate);

    const futureValue = futureValueOfInitial + futureValueOfContributions;
    const totalContributions = initialInvestment + (monthlyContribution * numberOfMonths);
    const totalInterest = futureValue - totalContributions;

    setResult({ futureValue, totalContributions, totalInterest });

    setSuggestionLoading(true);
    setSuggestion('');
    try {
      const res = await suggestNextStep({ calculatorName: 'Investment Calculator' });
      setSuggestion(res.suggestion);
    } catch (error) {
      console.error('Failed to get AI suggestion:', error);
      setSuggestion("The power of compound interest grows over time. Try increasing the number of years to see the long-term impact.");
    } finally {
      setSuggestionLoading(false);
    }
  };

  const resetCalculator = () => {
    form.reset({
      initialInvestment: undefined,
      monthlyContribution: undefined,
      years: undefined,
      annualReturn: 7,
    });
    setResult(null);
    setSuggestion('');
    setSuggestionLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                  <CardTitle>Investment Growth Calculator</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="initialInvestment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Initial Investment ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 1000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="monthlyContribution"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Contribution ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 200" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="years"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years to Grow</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="annualReturn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Annual Return (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="e.g., 7" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={resetCalculator}>
                  Reset
                </Button>
                <Button type="submit">
                  <CalculatorIcon className="mr-2 h-4 w-4" />
                  Calculate
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>

      <div>
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Projected Growth</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {result ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Future Value</p>
                  <p className="text-3xl font-bold text-primary">${result.futureValue.toLocaleString('en-US', {maximumFractionDigits: 0})}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Contributions</p>
                  <p className="text-xl font-bold">${result.totalContributions.toLocaleString('en-US', {maximumFractionDigits: 0})}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Interest</p>
                  <p className="text-xl font-bold">${result.totalInterest.toLocaleString('en-US', {maximumFractionDigits: 0})}</p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-center">
                Enter details to project your investment growth.
              </p>
            )}

            {(suggestion || suggestionLoading) && (
                 <div className="pt-6 border-t">
                  <CardHeader className="p-0 mb-2 flex-row items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Next Step</CardTitle>
                  </CardHeader>
                  <CardDescription>
                    {suggestionLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    ) : (
                      suggestion
                    )}
                  </CardDescription>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
