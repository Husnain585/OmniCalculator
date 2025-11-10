"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Calculator as CalculatorIcon, Lightbulb } from 'lucide-react';
import { suggestNextStep } from '@/ai/flows/suggest-next-step';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  loanAmount: z.coerce.number().positive('Loan amount must be positive'),
  loanTerm: z.coerce.number().int().positive('Loan term must be a positive number of years'),
  interestRate: z.coerce.number().min(0, 'Interest rate cannot be negative'),
});

type FormValues = z.infer<typeof formSchema>;

interface AmortizationEntry {
  month: number;
  principal: number;
  interest: number;
  balance: number;
}

const chartConfig = {
  balance: {
    label: 'Balance',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function AmortizationCalculator() {
  const [schedule, setSchedule] = useState<AmortizationEntry[]>([]);
  const [summary, setSummary] = useState<{ monthlyPayment: number, totalInterest: number, totalPayment: number } | null>(null);
  const [suggestion, setSuggestion] = useState('');
  const [suggestionLoading, setSuggestionLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { loanTerm: 30 },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const principal = data.loanAmount;
    const monthlyInterestRate = data.interestRate / 100 / 12;
    const numberOfPayments = data.loanTerm * 12;

    const monthlyPayment =
      principal *
      (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    
    if (!isFinite(monthlyPayment)) {
      form.setError("interestRate", { message: "Cannot calculate with this rate." });
      return;
    }
    
    const newSchedule: AmortizationEntry[] = [];
    let balance = principal;
    let totalInterest = 0;

    for (let i = 1; i <= numberOfPayments; i++) {
      const interestPayment = balance * monthlyInterestRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;
      totalInterest += interestPayment;

      newSchedule.push({
        month: i,
        interest: interestPayment,
        principal: principalPayment,
        balance: balance > 0 ? balance : 0,
      });
    }

    setSchedule(newSchedule);
    setSummary({
      monthlyPayment,
      totalInterest,
      totalPayment: monthlyPayment * numberOfPayments
    });

    setSuggestionLoading(true);
    setSuggestion('');
    try {
      const res = await suggestNextStep({ calculatorName: 'Amortization Calculator' });
      setSuggestion(res.suggestion);
    } catch (error) {
      console.error('Failed to get AI suggestion:', error);
      setSuggestion("Consider making bi-weekly payments instead of monthly to pay off your loan faster and save thousands in interest.");
    } finally {
      setSuggestionLoading(false);
    }
  };

  const resetCalculator = () => {
    form.reset({ loanAmount: undefined, interestRate: undefined, loanTerm: 30 });
    setSchedule([]);
    setSummary(null);
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField control={form.control} name="loanAmount" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Amount ($)</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 300000" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="loanTerm" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Term (Years)</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 30" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="interestRate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interest Rate (%)</FormLabel>
                      <FormControl><Input type="number" step="0.01" placeholder="e.g., 6.5" {...field} /></FormControl>
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

        {schedule.length > 0 && (
          <>
            <Card>
              <CardHeader><CardTitle>Amortization Schedule</CardTitle></CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead className="w-1/4">Month</TableHead>
                        <TableHead className="w-1/4 text-right">Principal</TableHead>
                        <TableHead className="w-1/4 text-right">Interest</TableHead>
                        <TableHead className="w-1/4 text-right">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schedule.map((entry) => (
                        <TableRow key={entry.month}>
                          <TableCell>{entry.month}</TableCell>
                          <TableCell className="text-right">${entry.principal.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${entry.interest.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${entry.balance.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="formula">
                <AccordionTrigger>How are the payments calculated?</AccordionTrigger>
                <AccordionContent>
                   <p className="mb-4">
                    The monthly payment is calculated using the standard formula for an amortizing loan:
                  </p>
                  <div className="bg-muted p-4 rounded-md text-center font-mono text-sm overflow-x-auto">
                    M = P [ r(1+r)^n ] / [ (1+r)^n – 1]
                  </div>
                   <ul className="mt-4 list-disc list-inside space-y-1 text-sm">
                    <li><b>M</b> = Monthly Payment</li>
                    <li><b>P</b> = Principal Loan Amount</li>
                    <li><b>r</b> = Monthly Interest Rate (annual rate / 12)</li>
                    <li><b>n</b> = Number of Payments (loan term in years * 12)</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )}
      </div>

      <div>
        <Card className="sticky top-24">
          <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {summary ? (
              <>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Monthly Payment</p>
                  <p className="text-3xl font-bold text-primary">${summary.monthlyPayment.toFixed(2)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                        <p className="text-sm text-muted-foreground">Total Interest</p>
                        <p className="font-semibold">${summary.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Paid</p>
                        <p className="font-semibold">${summary.totalPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                </div>
                
                 <div className="h-48 pt-4 border-t">
                  <ChartContainer config={chartConfig}>
                    <AreaChart data={schedule} margin={{ left: 0, right: 0, top: 5, bottom: 0 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => (value % 12 === 0 ? `Yr ${value/12}`: '')} />
                      <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `$${value / 1000}k`} />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                      <Area dataKey="balance" type="natural" fill="var(--color-balance)" fillOpacity={0.4} stroke="var(--color-balance)" />
                    </AreaChart>
                  </ChartContainer>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-center">Enter loan details to see summary and schedule.</p>
            )}

            {(suggestion || suggestionLoading) && (
              <div className="pt-6 border-t">
                <CardHeader className="p-0 mb-2 flex-row items-center gap-2"><Lightbulb className="h-5 w-5 text-primary" /><CardTitle className="text-lg">Next Step</CardTitle></CardHeader>
                {suggestionLoading ? (
                  <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div>
                ) : ( <p className="text-sm text-muted-foreground">{suggestion}</p> )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
