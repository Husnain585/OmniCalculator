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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calculator as CalculatorIcon, Lightbulb, Percent } from 'lucide-react';
import { suggestNextStep } from '@/ai/flows/suggest-next-step';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
    calculationType: z.string(),
    value1: z.coerce.number(),
    value2: z.coerce.number(),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
  text: string;
  value: string;
}

export default function PercentageCalculator() {
  const [result, setResult] = useState<Result | null>(null);
  const [suggestion, setSuggestion] = useState('');
  const [suggestionLoading, setSuggestionLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      calculationType: 'percentOf',
      value1: undefined,
      value2: undefined,
    },
  });

  const calculationType = form.watch('calculationType');

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { calculationType, value1, value2 } = data;
    let calcResult: Result | null = null;

    switch (calculationType) {
        case 'percentOf':
            const percentOfResult = (value1 / 100) * value2;
            calcResult = { text: `${value1}% of ${value2} is`, value: percentOfResult.toLocaleString() };
            break;
        case 'isWhatPercentOf':
            if (value2 === 0) {
                form.setError('value2', { message: 'Cannot be zero.'});
                return;
            }
            const isWhatPercentOfResult = (value1 / value2) * 100;
            calcResult = { text: `${value1} is what percent of ${value2}?`, value: `${isWhatPercentOfResult.toFixed(2)}%` };
            break;
        case 'percentChange':
             if (value1 === 0) {
                form.setError('value1', { message: 'Cannot be zero for percentage change.'});
                return;
            }
            const changeResult = ((value2 - value1) / value1) * 100;
            const changeType = changeResult >= 0 ? 'increase' : 'decrease';
            calcResult = { text: `From ${value1} to ${value2} is a`, value: `${Math.abs(changeResult).toFixed(2)}% ${changeType}` };
            break;
    }

    setResult(calcResult);

    setSuggestionLoading(true);
    setSuggestion('');
    try {
      const res = await suggestNextStep({ calculatorName: 'Percentage Calculator' });
      setSuggestion(res.suggestion);
    } catch (error) {
      console.error('Failed to get AI suggestion:', error);
      setSuggestion("Percentages are everywhere! Try using this for calculating tips, store discounts, or tracking your own goals.");
    } finally {
      setSuggestionLoading(false);
    }
  };

  const resetCalculator = () => {
    form.reset({
      calculationType: 'percentOf',
      value1: undefined,
      value2: undefined,
    });
    setResult(null);
    setSuggestion('');
    setSuggestionLoading(false);
  };
  
  const getLabels = () => {
    switch (calculationType) {
        case 'percentOf':
            return { label1: 'Percent (%)', label2: 'Of Number' };
        case 'isWhatPercentOf':
            return { label1: 'Value', label2: 'Is what percent of' };
        case 'percentChange':
            return { label1: 'Initial Value', label2: 'Final Value' };
        default:
             return { label1: 'Value 1', label2: 'Value 2' };
    }
  }
  
  const { label1, label2 } = getLabels();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="p-6 space-y-6">
                <FormField
                    control={form.control}
                    name="calculationType"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Calculation Type</FormLabel>
                        <Select onValueChange={(value) => {
                            field.onChange(value);
                            setResult(null);
                            setSuggestion('');
                            form.clearErrors();
                        }} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a calculation type" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="percentOf">What is X% of Y?</SelectItem>
                                <SelectItem value="isWhatPercentOf">X is what percent of Y?</SelectItem>
                                <SelectItem value="percentChange">What is the % change from X to Y?</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="value1"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>{label1}</FormLabel>
                            <FormControl>
                            <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="value2"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>{label2}</FormLabel>
                            <FormControl>
                            <Input type="number" {...field} />
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
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6 text-center">
            {result ? (
              <div>
                  <p className="text-sm text-muted-foreground">{result.text}</p>
                  <p className="text-4xl font-bold text-primary my-2">{result.value}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Enter values to see the result.
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
