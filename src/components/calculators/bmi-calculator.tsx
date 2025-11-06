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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Code, Share2, Calculator as CalculatorIcon, Lightbulb } from 'lucide-react';
import { suggestNextStep } from '@/ai/flows/suggest-next-step';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  height: z.coerce.number().positive('Height must be positive'),
  weight: z.coerce.number().positive('Weight must be positive'),
});

type BmiFormValues = z.infer<typeof formSchema>;

export default function BmiCalculator() {
  const [bmi, setBmi] = useState<number | null>(null);
  const [bmiCategory, setBmiCategory] = useState<string>('');
  const [suggestion, setSuggestion] = useState('');
  const [suggestionLoading, setSuggestionLoading] = useState(false);

  const form = useForm<BmiFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      height: undefined,
      weight: undefined,
    },
  });

  const onSubmit: SubmitHandler<BmiFormValues> = async (data) => {
    const heightInMeters = data.height / 100;
    const calculatedBmi = data.weight / (heightInMeters * heightInMeters);
    setBmi(calculatedBmi);

    let category = '';
    if (calculatedBmi < 18.5) {
      category = 'Underweight';
    } else if (calculatedBmi >= 18.5 && calculatedBmi < 25) {
      category = 'Normal weight';
    } else if (calculatedBmi >= 25 && calculatedBmi < 30) {
      category = 'Overweight';
    } else {
      category = 'Obesity';
    }
    setBmiCategory(category);
    
    // Fetch AI suggestion
    setSuggestionLoading(true);
    setSuggestion('');
    try {
      const result = await suggestNextStep({ calculatorName: 'BMI Calculator' });
      setSuggestion(result.suggestion);
    } catch (error) {
      console.error('Failed to get AI suggestion:', error);
      setSuggestion("Consider tracking your daily calories or exploring a fitness plan to complement your health goals.");
    } finally {
      setSuggestionLoading(false);
    }
  };

  const resetCalculator = () => {
    form.reset();
    setBmi(null);
    setBmiCategory('');
    setSuggestion('');
    setSuggestionLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (cm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 175"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 70"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetCalculator}
                >
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
          <CardContent className="text-center p-6 space-y-6">
            {bmi !== null ? (
              <div>
                <p className="text-sm text-muted-foreground">Your BMI is</p>
                <p className="text-5xl font-bold my-2">{bmi.toFixed(2)}</p>
                <p className="text-lg font-semibold text-primary">
                  {bmiCategory}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Enter your height and weight to see your BMI.
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

      <div className="lg:col-span-3 mt-8">
        <Accordion type="single" collapsible>
          <AccordionItem value="explanation">
            <AccordionTrigger>How is BMI calculated?</AccordionTrigger>
            <AccordionContent>
              <p>
                Body Mass Index (BMI) is a measure of body fat based on height
                and weight that applies to adult men and women. The formula is:
              </p>
              <p className="font-mono bg-muted p-4 rounded-md my-4">
                BMI = weight (kg) / [height (m)]²
              </p>
              <p>
                The result is then used to categorize your weight status as
                underweight, normal weight, overweight, or obese.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
