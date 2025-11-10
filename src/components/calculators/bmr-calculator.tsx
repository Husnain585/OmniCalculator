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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calculator as CalculatorIcon, Lightbulb } from 'lucide-react';
import { suggestNextStep } from '@/ai/flows/suggest-next-step';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  age: z.coerce.number().int().positive('Age must be a positive number'),
  gender: z.enum(['male', 'female']),
  height: z.coerce.number().positive('Height must be positive'),
  weight: z.coerce.number().positive('Weight must be positive'),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
  bmr: number;
}

export default function BmrCalculator() {
  const [result, setResult] = useState<Result | null>(null);
  const [suggestion, setSuggestion] = useState('');
  const [suggestionLoading, setSuggestionLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: 'male',
      age: undefined,
      height: undefined,
      weight: undefined,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { age, gender, height, weight } = data;
    
    let bmr: number;
    // Using Mifflin-St Jeor Equation
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    setResult({ bmr: Math.round(bmr) });

    setSuggestionLoading(true);
    setSuggestion('');
    try {
      const res = await suggestNextStep({ calculatorName: 'BMR Calculator' });
      setSuggestion(res.suggestion);
    } catch (error) {
      console.error('Failed to get AI suggestion:', error);
      setSuggestion("Your BMR is the baseline. Use our Calorie Calculator to find your total daily energy expenditure based on your activity level.");
    } finally {
      setSuggestionLoading(false);
    }
  };

  const resetCalculator = () => {
    form.reset({
      gender: 'male',
      age: undefined,
      height: undefined,
      weight: undefined,
    });
    setResult(null);
    setSuggestion('');
    setSuggestionLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="e.g., 25" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                            <FormLabel>Gender</FormLabel>
                            <FormControl>
                                <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex space-x-4 pt-2"
                                >
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                    <RadioGroupItem value="male" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Male</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                    <RadioGroupItem value="female" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Female</FormLabel>
                                </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Height (cm)</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="e.g., 180" {...field} />
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
                            <Input type="number" placeholder="e.g., 75" {...field} />
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
         <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="formula">
            <AccordionTrigger>How is BMR calculated?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-4">
                This calculator uses the Mifflin-St Jeor equation, which is considered more accurate than the older Harris-Benedict equation. The formulas are:
              </p>
              <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold">For Men:</h4>
                    <p className="font-mono bg-muted p-4 rounded-md my-2 text-sm">
                        BMR = 10 * weight (kg) + 6.25 * height (cm) - 5 * age (y) + 5
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">For Women:</h4>
                    <p className="font-mono bg-muted p-4 rounded-md my-2 text-sm">
                        BMR = 10 * weight (kg) + 6.25 * height (cm) - 5 * age (y) - 161
                    </p>
                  </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                BMR represents the number of calories your body needs to perform basic life-sustaining functions at rest.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div>
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>BMR Result</CardTitle>
             <CardDescription>Based on the Mifflin-St Jeor equation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {result ? (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Your Basal Metabolic Rate</p>
                <p className="text-5xl font-bold text-primary">{result.bmr.toLocaleString()}</p>
                <p className="text-lg text-muted-foreground">calories/day</p>
              </div>
            ) : (
              <p className="text-muted-foreground text-center">
                Enter your details to estimate your BMR.
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
