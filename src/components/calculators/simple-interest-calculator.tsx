"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Code, Share2, Calculator as CalculatorIcon } from 'lucide-react';

const formSchema = z.object({
  principal: z.coerce.number().positive('Principal must be positive'),
  rate: z.coerce.number().min(0, 'Interest rate cannot be negative'),
  time: z.coerce.number().positive('Time period must be positive'),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
  interest: number;
  total: number;
}

export default function SimpleInterestCalculator() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      principal: undefined,
      rate: undefined,
      time: undefined,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const interest = data.principal * (data.rate / 100) * data.time;
    const total = data.principal + interest;
    setResult({ interest, total });
  };

  const resetCalculator = () => {
    form.reset();
    setResult(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="p-6 space-y-6">
                <FormField
                  control={form.control}
                  name="principal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Principal Amount ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 10000"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Annual Interest Rate (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 5"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Period (Years)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 2"
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
          <CardContent className="space-y-4 p-6">
            {result ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Interest
                  </p>
                  <p className="text-3xl font-bold">
                    ${result.interest.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-3xl font-bold text-primary">
                    ${result.total.toFixed(2)}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-center">
                Enter the details to see the calculation.
              </p>
            )}
          </CardContent>
          {result && (
            <CardFooter className="flex justify-center gap-2">
              <Button variant="ghost" size="icon">
                <Code className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>

      <div className="lg:col-span-3 mt-8">
        <Accordion type="single" collapsible>
          <AccordionItem value="explanation">
            <AccordionTrigger>
              How is Simple Interest calculated?
            </AccordionTrigger>
            <AccordionContent>
              <p>
                Simple interest is a quick and easy method of calculating the
                interest charge on a loan. The formula is:
              </p>
              <p className="font-mono bg-muted p-4 rounded-md my-4">
                Simple Interest = Principal × Rate × Time
              </p>
              <p>
                Where 'Principal' is the initial amount of money, 'Rate' is the
                annual interest rate (in decimal), and 'Time' is the number of
                periods (usually years).
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
