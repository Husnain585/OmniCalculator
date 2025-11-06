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
import { Calculator as CalculatorIcon, Lightbulb, ArrowRightLeft } from 'lucide-react';
import { suggestNextStep } from '@/ai/flows/suggest-next-step';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  usd: z.coerce.number().min(0, 'Amount must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const PKR_PER_USD = 278.50; // Approximate rate

interface Result {
  pkr: number;
  usd: number;
}

export default function CurrencyConverter() {
  const [result, setResult] = useState<Result | null>(null);
  const [suggestion, setSuggestion] = useState('');
  const [suggestionLoading, setSuggestionLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { usd } = data;
    const pkr = usd * PKR_PER_USD;
    setResult({ usd, pkr });

    setSuggestionLoading(true);
    setSuggestion('');
    try {
      const res = await suggestNextStep({ calculatorName: 'Currency Converter' });
      setSuggestion(res.suggestion);
    } catch (error) {
      console.error('Failed to get AI suggestion:', error);
      setSuggestion("Exchange rates fluctuate daily. For financial transactions, always check with a bank or a money exchange service for the latest rates.");
    } finally {
      setSuggestionLoading(false);
    }
  };

  const resetCalculator = () => {
    form.reset({
      usd: undefined,
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
                <CardTitle>USD to PKR Converter</CardTitle>
                <CardDescription>Convert United States Dollars to Pakistani Rupees.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <FormField
                    control={form.control}
                    name="usd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount in USD ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 100" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="text-sm text-muted-foreground">
                      Exchange Rate (Approx.): 1 USD ≈ {PKR_PER_USD} PKR
                  </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={resetCalculator}>
                  Reset
                </Button>
                <Button type="submit">
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  Convert
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>

      <div>
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Conversion Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6 text-center">
            {result ? (
              <div>
                <p className="text-sm text-muted-foreground">{result.usd.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} is approximately</p>
                <p className="text-4xl font-bold text-primary my-2">{result.pkr.toLocaleString('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 2 })}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Enter an amount in USD to see the conversion.
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
