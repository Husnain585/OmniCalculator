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

const currentYear = new Date().getFullYear();

const formSchema = z.object({
  initialAmount: z.coerce.number().positive('Initial amount must be positive'),
  startYear: z.coerce.number().int().min(1900, 'Year must be after 1900').max(currentYear),
  endYear: z.coerce.number().int().min(1900, 'Year must be after 1900'),
  inflationRate: z.coerce.number().min(0, 'Inflation rate cannot be negative'),
}).refine(data => data.endYear > data.startYear, {
  message: 'End year must be after start year.',
  path: ['endYear'],
});


type FormValues = z.infer<typeof formSchema>;

interface Result {
  futureValue: number;
  purchasingPower: number;
}

export default function InflationCalculator() {
  const [result, setResult] = useState<Result | null>(null);
  const [suggestion, setSuggestion] = useState('');
  const [suggestionLoading, setSuggestionLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        startYear: currentYear - 10,
        endYear: currentYear,
        inflationRate: 3, // Historical average
    }
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { initialAmount, startYear, endYear, inflationRate } = data;
    const years = endYear - startYear;
    const rate = inflationRate / 100;

    const futureValue = initialAmount * Math.pow(1 + rate, years);
    const purchasingPower = (initialAmount / futureValue) * 100;

    setResult({ futureValue, purchasingPower });

    setSuggestionLoading(true);
    setSuggestion('');
    try {
      const res = await suggestNextStep({ calculatorName: 'Inflation Calculator' });
      setSuggestion(res.suggestion);
    } catch (error) {
      console.error('Failed to get AI suggestion:', error);
      setSuggestion("To beat inflation, your investments need to earn a higher return than the inflation rate. Explore our Investment Calculator to project growth.");
    } finally {
      setSuggestionLoading(false);
    }
  };

  const resetCalculator = () => {
    form.reset({
        initialAmount: undefined,
        startYear: currentYear - 10,
        endYear: currentYear,
        inflationRate: 3,
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
                <CardTitle>Inflation Calculator</CardTitle>
                <CardDescription>See how the value of money changes over time.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField control={form.control} name="initialAmount" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Initial Amount ($)</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 1000" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField control={form.control} name="startYear" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Start Year</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="endYear" render={({ field }) => (
                        <FormItem>
                            <FormLabel>End Year</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="inflationRate" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Avg. Inflation (%)</FormLabel>
                            <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={resetCalculator}>Reset</Button>
                <Button type="submit"><CalculatorIcon className="mr-2 h-4 w-4" />Calculate</Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>

      <div>
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Result</CardTitle>
            <CardDescription>The effect of inflation over time.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6 text-center">
            {result ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">
                    ${form.getValues('initialAmount').toLocaleString()} in {form.getValues('startYear')} has the same buying power as
                  </p>
                  <p className="text-4xl font-bold text-primary my-2">${result.futureValue.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                   <p className="text-sm text-muted-foreground">in {form.getValues('endYear')}.</p>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">A decrease of</p>
                  <p className="text-2xl font-bold">{(100 - result.purchasingPower).toFixed(2)}%</p>
                  <p className="text-sm text-muted-foreground">in purchasing power.</p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Enter details to see the calculation.</p>
            )}

            {(suggestion || suggestionLoading) && (
              <div className="pt-6 border-t">
                <CardHeader className="p-0 mb-2 flex-row items-center gap-2 justify-center"><Lightbulb className="h-5 w-5 text-primary" /><CardTitle className="text-lg">Pro Tip</CardTitle></CardHeader>
                <CardDescription>
                  {suggestionLoading ? (
                    <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div>
                  ) : ( suggestion )}
                </CardDescription>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
