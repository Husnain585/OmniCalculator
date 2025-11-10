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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  numberA: z.coerce.number().int('Must be an integer'),
  numberB: z.coerce.number().int('Must be an integer'),
});

type FormValues = z.infer<typeof formSchema>;

export default function GcdCalculator() {
  const [result, setResult] = useState<number | null>(null);
  const [suggestion, setSuggestion] = useState('');
  const [suggestionLoading, setSuggestionLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });
  
  const gcd = (a: number, b: number): number => {
    a = Math.abs(a);
    b = Math.abs(b);
    while(b) {
      [a, b] = [b, a % b];
    }
    return a;
  }

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { numberA, numberB } = data;
    setResult(gcd(numberA, numberB));

    setSuggestionLoading(true);
    setSuggestion('');
    try {
      const res = await suggestNextStep({ calculatorName: 'GCD Calculator' });
      setSuggestion(res.suggestion);
    } catch (error) {
      console.error('Failed to get AI suggestion:', error);
      setSuggestion("The GCD is useful for simplifying fractions. Try it with our Fraction Calculator!");
    } finally {
      setSuggestionLoading(false);
    }
  };

  const resetCalculator = () => {
    form.reset({
      numberA: undefined,
      numberB: undefined,
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
              <CardHeader>
                  <CardTitle>Greatest Common Divisor (GCD)</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="numberA"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Number A</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="e.g., 48" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="numberB"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Number B</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="e.g., 18" {...field} />
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
            <AccordionTrigger>How is the GCD calculated?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-4">
                This calculator uses the Euclidean algorithm to find the greatest common divisor (GCD) of two integers. It's an efficient method that repeatedly uses the division algorithm.
              </p>
              <div className="bg-muted p-4 rounded-md text-center">
                <p className="font-mono text-sm">
                  gcd(a, b) = gcd(b, a % b)
                </p>
              </div>
              <p className="mt-4 text-sm">
                The process continues until the remainder (a % b) is 0. The GCD is the last non-zero remainder.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div>
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6 text-center">
            {result !== null ? (
              <div>
                  <p className="text-sm text-muted-foreground">The GCD is</p>
                  <p className="text-6xl font-bold text-primary my-2">{result}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Enter two numbers to find their GCD.
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
