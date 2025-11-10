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
import { Calculator as CalculatorIcon, Lightbulb, Footprints } from 'lucide-react';
import { suggestNextStep } from '@/ai/flows/suggest-next-step';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  distance: z.coerce.number().positive('Distance must be positive'),
  hours: z.coerce.number().min(0).int(),
  minutes: z.coerce.number().min(0).max(59).int(),
  seconds: z.coerce.number().min(0).max(59).int(),
}).refine(data => data.hours > 0 || data.minutes > 0 || data.seconds > 0, {
  message: 'Total time must be greater than zero.',
  path: ['hours'],
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
  paceMinPerKm: string;
  paceMinPerMile: string;
}

export default function PaceCalculator() {
  const [result, setResult] = useState<Result | null>(null);
  const [suggestion, setSuggestion] = useState('');
  const [suggestionLoading, setSuggestionLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      distance: undefined,
      hours: 0,
      minutes: 0,
      seconds: 0,
    }
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { distance, hours, minutes, seconds } = data;
    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    
    // Pace in seconds per km
    const secondsPerKm = totalSeconds / distance;
    const paceMinPerKm = Math.floor(secondsPerKm / 60);
    const paceSecPerKm = Math.round(secondsPerKm % 60);

    // Pace in seconds per mile
    const distanceMiles = distance * 0.621371;
    const secondsPerMile = totalSeconds / distanceMiles;
    const paceMinPerMile = Math.floor(secondsPerMile / 60);
    const paceSecPerMile = Math.round(secondsPerMile % 60);

    setResult({
        paceMinPerKm: `${paceMinPerKm}:${paceSecPerKm.toString().padStart(2, '0')}`,
        paceMinPerMile: `${paceMinPerMile}:${paceSecPerMile.toString().padStart(2, '0')}`,
    });

    setSuggestionLoading(true);
    setSuggestion('');
    try {
      const res = await suggestNextStep({ calculatorName: 'Pace Calculator' });
      setSuggestion(res.suggestion);
    } catch (error) {
      console.error('Failed to get AI suggestion:', error);
      setSuggestion("Consistency is key! Try to maintain a similar pace for your next run to build endurance.");
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
              <CardHeader>
                  <CardTitle>Running Pace Calculator</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <FormField
                    control={form.control}
                    name="distance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Distance (km)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="e.g., 5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                <div>
                  <FormLabel>Time</FormLabel>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <FormField
                        control={form.control}
                        name="hours"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">Hours</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="minutes"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">Minutes</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="25" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="seconds"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">Seconds</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="30" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={resetCalculator}>
                  Reset
                </Button>
                <Button type="submit">
                  <CalculatorIcon className="mr-2 h-4 w-4" />
                  Calculate Pace
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="formula">
            <AccordionTrigger>How is pace calculated?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-4">
                Pace is calculated by dividing the total time by the total distance. The result is then formatted into minutes and seconds.
              </p>
              <div className="bg-muted p-4 rounded-md text-center">
                <p className="font-mono text-sm">
                  Pace = Total Time / Distance
                </p>
              </div>
              <p className="mt-4 text-sm">
                Total time is first converted into seconds to ensure an accurate calculation before being converted back into a more readable format.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div>
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Your Pace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6 text-center">
            {result ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Per Kilometer</p>
                  <p className="text-2xl font-bold text-primary">{result.paceMinPerKm}</p>
                  <p className="text-xs text-muted-foreground">min/km</p>
                </div>
                 <div>
                  <p className="text-sm text-muted-foreground">Per Mile</p>
                  <p className="text-2xl font-bold">{result.paceMinPerMile}</p>
                  <p className="text-xs text-muted-foreground">min/mi</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Enter your distance and time to calculate your pace.
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
