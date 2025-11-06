"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addDays, format, differenceInWeeks } from 'date-fns';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Calculator, Lightbulb } from 'lucide-react';
import { suggestNextStep } from '@/ai/flows/suggest-next-step';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  lastPeriodDate: z.date({
    required_error: 'Last period date is required.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
  dueDate: string;
  gestationalAge: number;
}

export default function DueDateCalculator() {
  const [result, setResult] = useState<Result | null>(null);
  const [suggestion, setSuggestion] = useState('');
  const [suggestionLoading, setSuggestionLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { lastPeriodDate } = data;
    const dueDate = addDays(lastPeriodDate, 280); // 280 days = 40 weeks
    const gestationalAge = differenceInWeeks(new Date(), lastPeriodDate);

    setResult({
      dueDate: format(dueDate, 'PPP'),
      gestationalAge,
    });

    setSuggestionLoading(true);
    setSuggestion('');
    try {
      const result = await suggestNextStep({ calculatorName: 'Due Date Calculator' });
      setSuggestion(result.suggestion);
    } catch (error) {
      console.error('Failed to get AI suggestion:', error);
      setSuggestion("Every pregnancy is unique. Use this estimate as a guide and be sure to consult with your healthcare provider for accurate tracking.");
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
      <div className="lg:col-span-2">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="p-6 space-y-6">
                <FormField
                  control={form.control}
                  name="lastPeriodDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>First Day of Last Menstrual Period</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
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
                  <Calculator className="mr-2 h-4 w-4" /> Calculate
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>

      <div>
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Pregnancy Estimate</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-center">
            {result ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Due Date</p>
                  <p className="text-2xl font-bold text-primary">{result.dueDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gestational Age</p>
                  <p className="text-2xl font-bold">{result.gestationalAge} weeks</p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">
                Enter the first day of your last period to see an estimate.
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
