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
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  taxRate: z.coerce.number().min(0, 'Tax rate cannot be negative'),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
  taxAmount: number;
  totalPrice: number;
}

export default function SalesTaxCalculator() {
  const [result, setResult] = useState<Result | null>(null);
  const [suggestion, setSuggestion] = useState('');
  const [suggestionLoading, setSuggestionLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      price: undefined,
      taxRate: undefined,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { price, taxRate } = data;
    const taxAmount = price * (taxRate / 100);
    const totalPrice = price + taxAmount;
    setResult({ taxAmount, totalPrice });

    setSuggestionLoading(true);
    setSuggestion('');
    try {
      const res = await suggestNextStep({ calculatorName: 'Sales Tax Calculator' });
      setSuggestion(res.suggestion);
    } catch (error) {
      console.error('Failed to get AI suggestion:', error);
      setSuggestion("Planning a big purchase? Use our Loan Calculator to see if financing is a good option for you.");
    } finally {
      setSuggestionLoading(false);
    }
  };

  const resetCalculator = () => {
    form.reset({ price: undefined, taxRate: undefined });
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
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pre-Tax Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 99.99" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="taxRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sales Tax Rate (%)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 8.5" {...field} />
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
            <AccordionTrigger>How is sales tax calculated?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-4">
                Sales tax is calculated by multiplying the pre-tax price by the tax rate (as a decimal). The total price is the pre-tax price plus the tax amount.
              </p>
              <div className="space-y-2">
                <div className="bg-muted p-4 rounded-md text-center">
                  <p className="font-mono text-sm">
                    Tax Amount = Price × (Tax Rate / 100)
                  </p>
                </div>
                <div className="bg-muted p-4 rounded-md text-center">
                  <p className="font-mono text-sm">
                    Total Price = Price + Tax Amount
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
            <CardTitle>Total Price</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6 text-center">
            {result ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Price</p>
                  <p className="text-4xl font-bold text-primary">${result.totalPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sales Tax</p>
                  <p className="text-xl font-semibold">${result.taxAmount.toFixed(2)}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Enter price and tax rate to see the total.
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
