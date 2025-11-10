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
  CardDescription,
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calculator, Lightbulb } from 'lucide-react';
import { suggestNextStep } from '@/ai/flows/suggest-next-step';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  length: z.coerce.number().positive('Length must be positive'),
  width: z.coerce.number().positive('Width must be positive'),
  depth: z.coerce.number().positive('Depth must be positive'),
  units: z.enum(['feet', 'meters']),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
  cubicYards: number;
  cubicMeters: number;
}

export default function ConcreteCalculator() {
  const [result, setResult] = useState<Result | null>(null);
  const [suggestion, setSuggestion] = useState('');
  const [suggestionLoading, setSuggestionLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      units: 'feet',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    let volumeCubicFeet: number;
    const { length, width, depth, units } = data;

    if (units === 'feet') {
      // Depth is in inches, convert to feet
      volumeCubicFeet = length * width * (depth / 12);
    } else { // meters
      // Convert everything to feet for a common calculation base
      const lengthFt = length * 3.28084;
      const widthFt = width * 3.28084;
      const depthFt = depth * 3.28084;
      volumeCubicFeet = lengthFt * widthFt * depthFt;
    }

    const cubicYards = volumeCubicFeet / 27;
    const cubicMeters = cubicYards * 0.764555;
    
    setResult({ cubicYards, cubicMeters });

    setSuggestionLoading(true);
    setSuggestion('');
    try {
      const result = await suggestNextStep({ calculatorName: 'Concrete Calculator' });
      setSuggestion(result.suggestion);
    } catch (error) {
      console.error('Failed to get AI suggestion:', error);
      setSuggestion("Always order about 10% extra concrete to account for spillage and uneven ground levels.");
    } finally {
      setSuggestionLoading(false);
    }
  };

  const resetCalculator = () => {
    form.reset({ units: 'feet', length: undefined, width: undefined, depth: undefined });
    setResult(null);
    setSuggestion('');
    setSuggestionLoading(false);
  };
  
  const unit = form.watch('units');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <FormField
                  control={form.control}
                  name="units"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Units</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="feet" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Feet / Inches
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="meters" />
                            </FormControl>
                            <FormLabel className="font-normal">Meters</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="length"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Length ({unit})</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="width"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Width ({unit})</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <FormField
                    control={form.control}
                    name="depth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Depth ({unit === 'feet' ? 'inches' : unit})</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                  <Calculator className="mr-2 h-4 w-4" /> Calculate
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="formula">
            <AccordionTrigger>How is concrete volume calculated?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-4">
                The total volume is first calculated in a consistent unit (like cubic feet or cubic meters). This is then converted to cubic yards, which is the standard unit for ordering concrete.
              </p>
              <div className="bg-muted p-4 rounded-md text-center mb-2">
                <p className="font-mono text-sm">
                  Volume = Length × Width × Depth
                </p>
              </div>
              <div className="bg-muted p-4 rounded-md text-center">
                <p className="font-mono text-sm">
                  Cubic Yards = Volume in Cubic Feet / 27
                </p>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Note: If using feet and inches, the depth in inches is first divided by 12 to convert it to feet.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div>
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Concrete Needed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {result ? (
              <div className="text-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Volume in Cubic Yards
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {result.cubicYards.toFixed(2)} yd³
                  </p>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">Volume in Cubic Meters</p>
                  <p className="text-3xl font-bold">
                    {result.cubicMeters.toFixed(2)} m³
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center">
                Enter dimensions to see the required volume.
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
