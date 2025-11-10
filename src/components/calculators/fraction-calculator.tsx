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
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Calculator as CalculatorIcon, X, Plus, Minus, Divide } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  n1: z.coerce.number().int('Numerator must be an integer.'),
  d1: z.coerce.number().int('Denominator must be an integer.').positive('Denominator must be positive.'),
  n2: z.coerce.number().int('Numerator must be an integer.'),
  d2: z.coerce.number().int('Denominator must be an integer.').positive('Denominator must be positive.'),
  operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
  numerator: number;
  denominator: number;
  mixed: string;
  decimal: string;
}

// Helper function to find the greatest common divisor
const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);

export default function FractionCalculator() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      operation: 'add',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    let nResult: number, dResult: number;
    const { n1, d1, n2, d2, operation } = data;

    switch (operation) {
      case 'add':
        nResult = n1 * d2 + n2 * d1;
        dResult = d1 * d2;
        break;
      case 'subtract':
        nResult = n1 * d2 - n2 * d1;
        dResult = d1 * d2;
        break;
      case 'multiply':
        nResult = n1 * n2;
        dResult = d1 * d2;
        break;
      case 'divide':
        nResult = n1 * d2;
        dResult = d1 * n2;
        break;
    }
    
    if (dResult === 0) {
        form.setError("root", { message: "Result has a zero denominator, cannot calculate."});
        setResult(null);
        return;
    }

    const commonDivisor = gcd(Math.abs(nResult), Math.abs(dResult));
    const simplifiedN = nResult / commonDivisor;
    const simplifiedD = dResult / commonDivisor;

    let mixed = '';
    if (Math.abs(simplifiedN) >= simplifiedD) {
      const whole = Math.trunc(simplifiedN / simplifiedD);
      const remN = simplifiedN % simplifiedD;
      if (remN !== 0) {
        mixed = `${whole} ${Math.abs(remN)}/${simplifiedD}`;
      } else {
        mixed = `${whole}`;
      }
    }

    setResult({
      numerator: simplifiedN,
      denominator: simplifiedD,
      mixed: mixed,
      decimal: (simplifiedN / simplifiedD).toFixed(4),
    });
  };

  const resetCalculator = () => {
    form.reset({ operation: 'add', n1: undefined, d1: undefined, n2: undefined, d2: undefined });
    setResult(null);
  };
  
  const operation = form.watch('operation');
  const operationIcons: {[key: string]: React.ReactNode} = {
    add: <Plus className="h-5 w-5" />,
    subtract: <Minus className="h-5 w-5" />,
    multiply: <X className="h-5 w-5" />,
    divide: <Divide className="h-5 w-5" />,
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-around">
                  <div className="flex flex-col items-center gap-1 w-24">
                     <FormField control={form.control} name="n1" render={({ field }) => (
                         <FormItem>
                           <FormControl><Input type="number" placeholder="Num" className="text-center" {...field} /></FormControl>
                           <FormMessage />
                         </FormItem>
                     )} />
                     <Separator className="h-1 bg-foreground" />
                     <FormField control={form.control} name="d1" render={({ field }) => (
                         <FormItem>
                           <FormControl><Input type="number" placeholder="Den" className="text-center" {...field} /></FormControl>
                           <FormMessage />
                         </FormItem>
                     )} />
                  </div>
                  
                  <div className="flex-shrink-0 mx-4">
                    {operationIcons[operation]}
                  </div>

                  <div className="flex flex-col items-center gap-1 w-24">
                     <FormField control={form.control} name="n2" render={({ field }) => (
                         <FormItem>
                           <FormControl><Input type="number" placeholder="Num" className="text-center" {...field} /></FormControl>
                           <FormMessage />
                         </FormItem>
                     )} />
                     <Separator className="h-1 bg-foreground" />
                     <FormField control={form.control} name="d2" render={({ field }) => (
                         <FormItem>
                           <FormControl><Input type="number" placeholder="Den" className="text-center" {...field} /></FormControl>
                           <FormMessage />
                         </FormItem>
                     )} />
                  </div>
                </div>

                <FormField
                    control={form.control}
                    name="operation"
                    render={({ field }) => (
                        <FormItem className="mt-8">
                        <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-4 gap-4"
                        >
                            <Label className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                <FormControl>
                                    <RadioGroupItem value="add" className="sr-only" />
                                </FormControl>
                                <Plus />
                            </Label>
                             <Label className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                <FormControl>
                                    <RadioGroupItem value="subtract" className="sr-only" />
                                </FormControl>
                                <Minus />
                            </Label>
                             <Label className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                <FormControl>
                                    <RadioGroupItem value="multiply" className="sr-only" />
                                </FormControl>
                                <X />
                            </Label>
                             <Label className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                <FormControl>
                                    <RadioGroupItem value="divide" className="sr-only" />
                                </FormControl>
                                <Divide />
                            </Label>
                        </RadioGroup>
                        </FormItem>
                    )}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={resetCalculator}>Reset</Button>
                <Button type="submit">
                  <CalculatorIcon className="mr-2 h-4 w-4" /> Calculate
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="formula">
            <AccordionTrigger>How are fractions calculated?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-4">
                Fraction operations follow standard mathematical rules. For addition and subtraction, a common denominator is found. For multiplication, numerators and denominators are multiplied directly. For division, the second fraction is inverted and then multiplied.
              </p>
              <div className="space-y-2 text-sm">
                <p><b>Addition:</b> (n1/d1) + (n2/d2) = (n1*d2 + n2*d1) / (d1*d2)</p>
                <p><b>Subtraction:</b> (n1/d1) - (n2/d2) = (n1*d2 - n2*d1) / (d1*d2)</p>
                <p><b>Multiplication:</b> (n1/d1) * (n2/d2) = (n1*n2) / (d1*d2)</p>
                <p><b>Division:</b> (n1/d1) / (n2/d2) = (n1*d2) / (d1*n2)</p>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                The result is then simplified by dividing the numerator and denominator by their greatest common divisor (GCD).
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
            {result ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Fraction</p>
                  <div className="text-3xl font-bold text-primary my-2">
                    <sup>{result.numerator}</sup>&frasl;<sub>{result.denominator}</sub>
                  </div>
                </div>
                {result.mixed && (
                    <div>
                        <p className="text-sm text-muted-foreground">Mixed Number</p>
                        <p className="text-2xl font-bold">{result.mixed}</p>
                    </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Decimal</p>
                  <p className="text-2xl font-bold">{result.decimal}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Enter fractions to see the result.</p>
            )}
             {form.formState.errors.root && (
                <p className="text-destructive text-sm font-medium">{form.formState.errors.root.message}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
