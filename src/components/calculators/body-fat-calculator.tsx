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
  gender: z.enum(['male', 'female']),
  height: z.coerce.number().positive('Height must be positive'),
  waist: z.coerce.number().positive('Waist must be positive'),
  neck: z.coerce.number().positive('Neck must be positive'),
  hip: z.coerce.number().optional(),
}).refine(data => data.gender === 'female' ? data.hip !== undefined && data.hip > 0 : true, {
  message: 'Hip measurement is required for females.',
  path: ['hip'],
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
  bodyFatPercentage: number;
}

export default function BodyFatCalculator() {
  const [result, setResult] = useState<Result | null>(null);
  const [suggestion, setSuggestion] = useState('');
  const [suggestionLoading, setSuggestionLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: 'male',
      height: undefined,
      waist: undefined,
      neck: undefined,
      hip: undefined,
    },
  });
  
  const gender = form.watch('gender');

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { gender, height, waist, neck, hip } = data;
    
    let bodyFatPercentage;
    if (gender === 'male') {
      bodyFatPercentage = 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
    } else {
      // hip is guaranteed to be a number for females due to schema refinement
      bodyFatPercentage = 163.205 * Math.log10(waist + hip! - neck) - 97.684 * Math.log10(height) - 78.387;
    }

    setResult({ bodyFatPercentage });

    setSuggestionLoading(true);
    setSuggestion('');
    try {
      const res = await suggestNextStep({ calculatorName: 'Body Fat Calculator' });
      setSuggestion(res.suggestion);
    } catch (error) {
      console.error('Failed to get AI suggestion:', error);
      setSuggestion("For best results, take measurements in the morning and be consistent with your technique.");
    } finally {
      setSuggestionLoading(false);
    }
  };

  const resetCalculator = () => {
    form.reset({
      gender: 'male',
      height: undefined,
      waist: undefined,
      neck: undefined,
      hip: undefined,
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
                  <CardTitle>Enter Your Measurements</CardTitle>
                  <CardDescription>All measurements should be in centimeters (cm).</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
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
                        name="neck"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Neck (cm)</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="e.g., 38" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="waist"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Waist (cm)</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="e.g., 90" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    {gender === 'female' && (
                        <FormField
                            control={form.control}
                            name="hip"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Hip (cm)</FormLabel>
                                <FormControl>
                                <Input type="number" placeholder="e.g., 97" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    )}
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
            <AccordionTrigger>How is body fat percentage calculated?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-4">
                This calculator uses the U.S. Navy method, which relies on body measurements. The formulas use the base-10 logarithm of the measurements.
              </p>
               <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold">For Men:</h4>
                    <p className="font-mono bg-muted p-4 rounded-md my-2 text-sm overflow-x-auto">
                      BFP = 86.010 * log10(waist - neck) - 70.041 * log10(height) + 36.76
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">For Women:</h4>
                    <p className="font-mono bg-muted p-4 rounded-md my-2 text-sm overflow-x-auto">
                      BFP = 163.205 * log10(waist + hip - neck) - 97.684 * log10(height) - 78.387
                    </p>
                  </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Note: This method is an estimate and may not be as accurate as clinical methods like DEXA scans.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div>
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Body Fat Estimate</CardTitle>
             <CardDescription>Using the U.S. Navy method.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {result ? (
              <div className="text-center">
                  <p className="text-sm text-muted-foreground">Estimated Body Fat</p>
                  <p className="text-5xl font-bold text-primary">{result.bodyFatPercentage.toFixed(1)}%</p>
              </div>
            ) : (
              <p className="text-muted-foreground text-center">
                Enter your measurements to get an estimate.
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
