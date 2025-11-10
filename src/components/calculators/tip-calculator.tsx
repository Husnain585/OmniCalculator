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
import { Slider } from '@/components/ui/slider';
import { Calculator as CalculatorIcon, Lightbulb, Users, HandCoins } from 'lucide-react';
import { suggestNextStep } from '@/ai/flows/suggest-next-step';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  bill: z.coerce.number().positive('Bill amount must be positive.'),
  tipPercent: z.number().min(0).max(100),
  people: z.coerce.number().int().min(1, 'Must be at least 1 person.'),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
  tipAmount: number;
  totalAmount: number;
  perPersonAmount: number;
}

export default function TipCalculator() {
  const [result, setResult] = useState<Result | null>(null);
  const [suggestion, setSuggestion] = useState('');
  const [suggestionLoading, setSuggestionLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bill: undefined,
      tipPercent: 18,
      people: 1,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { bill, tipPercent, people } = data;
    const tipAmount = bill * (tipPercent / 100);
    const totalAmount = bill + tipAmount;
    const perPersonAmount = totalAmount / people;

    setResult({ tipAmount, totalAmount, perPersonAmount });

    setSuggestionLoading(true);
    setSuggestion('');
    try {
      const res = await suggestNextStep({ calculatorName: 'Tip Calculator' });
      setSuggestion(res.suggestion);
    } catch (error) {
      console.error('Failed to get AI suggestion:', error);
      setSuggestion("Tipping customs vary by country. When traveling, it's always a good idea to check local etiquette!");
    } finally {
      setSuggestionLoading(false);
    }
  };

  const resetCalculator = () => {
    form.reset({
      bill: undefined,
      tipPercent: 18,
      people: 1,
    });
    setResult(null);
    setSuggestion('');
    setSuggestionLoading(false);
  };
  
  const tipPercentage = form.watch('tipPercent');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="p-6 space-y-8">
                <FormField
                  control={form.control}
                  name="bill"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bill Amount ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 54.95" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tipPercent"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center mb-2">
                        <FormLabel>Tip Percentage</FormLabel>
                        <span className="text-lg font-bold text-primary">{tipPercentage}%</span>
                      </div>
                      <FormControl>
                         <Slider
                            min={0}
                            max={50}
                            step={1}
                            value={[field.value]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                          />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="people"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Split Between</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={resetCalculator}>
                  Reset
                </Button>
                <Button type="submit">
                  <CalculatorIcon className="mr-2 h-4 w-4" />
                  Calculate Tip
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="formula">
            <AccordionTrigger>How is the tip calculated?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-4">
                The tip is calculated as a percentage of the bill. The total amount is the bill plus the tip, and this total is then divided by the number of people to get the per-person split.
              </p>
              <div className="space-y-2">
                <div className="bg-muted p-4 rounded-md text-center">
                  <p className="font-mono text-sm">
                    Tip Amount = Bill × (Tip Percentage / 100)
                  </p>
                </div>
                <div className="bg-muted p-4 rounded-md text-center">
                  <p className="font-mono text-sm">
                    Total Per Person = (Bill + Tip Amount) / Number of People
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div>
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Your Split</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6 text-center">
            {result ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Amount Per Person</p>
                  <p className="text-4xl font-bold text-primary">${result.perPersonAmount.toFixed(2)}</p>
                </div>
                <div className="grid grid-cols-2 text-left text-sm border-t pt-4">
                    <div>
                        <p className="text-muted-foreground">Total Tip</p>
                        <p className="font-semibold">${result.tipAmount.toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Total Bill</p>
                        <p className="font-semibold">${result.totalAmount.toFixed(2)}</p>
                    </div>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">
                Enter your bill details to calculate the split.
              </p>
            )}

            {(suggestion || suggestionLoading) && (
                 <div className="pt-6 border-t">
                  <CardHeader className="p-0 mb-2 flex-row items-center gap-2 justify-center">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Pro Tip</CardTitle>
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
