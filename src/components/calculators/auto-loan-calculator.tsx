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
  vehiclePrice: z.coerce.number().positive('Vehicle price must be positive'),
  downPayment: z.coerce.number().min(0, 'Down payment cannot be negative').default(0),
  tradeInValue: z.coerce.number().min(0, 'Trade-in value cannot be negative').default(0),
  loanTerm: z.coerce.number().int().positive('Loan term must be a positive number of months'),
  interestRate: z.coerce.number().min(0, 'Interest rate cannot be negative'),
  salesTaxRate: z.coerce.number().min(0, 'Sales tax rate cannot be negative').default(0),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  totalLoanAmount: number;
}

export default function AutoLoanCalculator() {
  const [result, setResult] = useState<Result | null>(null);
  const [suggestion, setSuggestion] = useState('');
  const [suggestionLoading, setSuggestionLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loanTerm: 60,
      downPayment: 0,
      tradeInValue: 0,
      salesTaxRate: 0,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { vehiclePrice, downPayment, tradeInValue, loanTerm, interestRate, salesTaxRate } = data;
    
    const taxableAmount = vehiclePrice - tradeInValue;
    const salesTax = taxableAmount * (salesTaxRate / 100);
    const principal = vehiclePrice + salesTax - downPayment - tradeInValue;
    
    if (principal <= 0) {
      setResult({ monthlyPayment: 0, totalPayment: 0, totalInterest: 0, totalLoanAmount: 0 });
      return;
    }

    const monthlyInterestRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm;

    const monthlyPayment = monthlyInterestRate === 0 
      ? principal / numberOfPayments
      : principal *
        (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
        (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    
    const totalPayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayment - principal;

    setResult({ 
        monthlyPayment, 
        totalPayment, 
        totalInterest,
        totalLoanAmount: principal
    });

    setSuggestionLoading(true);
    setSuggestion('');
    try {
      const res = await suggestNextStep({ calculatorName: 'Auto Loan Calculator' });
      setSuggestion(res.suggestion);
    } catch (error) {
      console.error('Failed to get AI suggestion:', error);
      setSuggestion("A larger down payment can lower your monthly payments and reduce the total interest you pay over the life of the loan.");
    } finally {
      setSuggestionLoading(false);
    }
  };

  const resetCalculator = () => {
    form.reset();
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
                  <FormField control={form.control} name="vehiclePrice" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Price ($)</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 35000" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="downPayment" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Down Payment ($)</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 5000" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <FormField control={form.control} name="tradeInValue" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trade-in Value ($)</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 10000" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="salesTaxRate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sales Tax Rate (%)</FormLabel>
                      <FormControl><Input type="number" step="0.01" placeholder="e.g., 7" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <FormField control={form.control} name="loanTerm" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Term (Months)</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 60" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="interestRate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interest Rate (%)</FormLabel>
                      <FormControl><Input type="number" step="0.01" placeholder="e.g., 5.5" {...field} /></FormControl>
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

        {result !== null && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="formula">
              <AccordionTrigger>How is the auto loan calculated?</AccordionTrigger>
              <AccordionContent>
                <p className="mb-4">
                  The total loan amount is calculated first by adding sales tax to the vehicle price and then subtracting the down payment and trade-in value. The monthly payment is then determined using the standard loan amortization formula.
                </p>
                <div className="bg-muted p-4 rounded-md text-center font-mono text-sm overflow-x-auto">
                  Loan Amount = (Vehicle Price - Trade-in) + Sales Tax - Down Payment
                </div>
                <div className="bg-muted p-4 rounded-md text-center font-mono text-sm overflow-x-auto mt-2">
                  M = P [ r(1+r)^n ] / [ (1+r)^n – 1]
                </div>
                <ul className="mt-4 list-disc list-inside space-y-1 text-sm">
                  <li><b>M</b> = Monthly Payment</li>
                  <li><b>P</b> = Principal Loan Amount</li>
                  <li><b>r</b> = Monthly Interest Rate</li>
                  <li><b>n</b> = Number of Payments (Loan Term in Months)</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>

      <div>
        <Card className="sticky top-24">
          <CardHeader><CardTitle>Loan Estimate</CardTitle></CardHeader>
          <CardContent className="space-y-4 p-6">
            {result ? (
              <>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Monthly Payment</p>
                  <p className="text-4xl font-bold text-primary">${result.monthlyPayment.toFixed(2)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Loan</p>
                    <p className="font-semibold">${result.totalLoanAmount.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Interest</p>
                    <p className="font-semibold">${result.totalInterest.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-center">Enter details to see an estimate.</p>
            )}

            {(suggestion || suggestionLoading) && (
              <div className="pt-6 border-t">
                <CardHeader className="p-0 mb-2 flex-row items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Next Step</CardTitle>
                </CardHeader>
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
