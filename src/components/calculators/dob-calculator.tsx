"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { differenceInYears, differenceInMonths, differenceInDays, format, getDay, isAfter, isBefore, isSameDay } from 'date-fns';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Calculator } from 'lucide-react';

const formSchema = z.object({
  dob: z.date({
    required_error: 'A date of birth is required.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
  years: number;
  months: number;
  days: number;
  birthDay: string;
}

export default function DobCalculator() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const now = new Date();
    const dob = data.dob;

    if (isAfter(dob, now)) {
      form.setError('dob', {
        type: 'manual',
        message: 'Date of birth cannot be in the future.',
      });
      setResult(null);
      return;
    }

    const years = differenceInYears(now, dob);
    let tempDate = new Date(dob);
    tempDate.setFullYear(tempDate.getFullYear() + years);
    
    const months = differenceInMonths(now, tempDate);
    tempDate = new Date(dob);
    tempDate.setFullYear(tempDate.getFullYear() + years);
    tempDate.setMonth(tempDate.getMonth() + months);
    
    const days = differenceInDays(now, tempDate);

    const dayOfWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const birthDay = dayOfWeek[getDay(dob)];

    setResult({ years, months, days, birthDay });
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
                  name="dob"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Birth</FormLabel>
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
                            disabled={(date) =>
                              isAfter(date, new Date()) ||
                              isAfter(date, new Date('2400-01-01'))
                            }
                            initialFocus
                            captionLayout="dropdown-buttons"
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                          />
                        </PopoverContent>
                      </Popover>
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
                  <Calculator className="mr-2 h-4 w-4" /> Calculate Age
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>

      <div>
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Your Age</CardTitle>
            <CardDescription>Calculated from your date of birth.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {result ? (
              <>
                <div className="text-center">
                    <p className="text-5xl font-bold">{result.years}</p>
                    <p className="text-lg text-muted-foreground">Years</p>
                </div>
                <div className="grid grid-cols-2 text-center">
                    <div>
                        <p className="text-2xl font-semibold">{result.months}</p>
                        <p className="text-sm text-muted-foreground">Months</p>
                    </div>
                    <div>
                        <p className="text-2xl font-semibold">{result.days}</p>
                        <p className="text-sm text-muted-foreground">Days</p>
                    </div>
                </div>
                 <div className="text-center pt-4">
                    <p className="text-sm text-muted-foreground">You were born on a</p>
                    <p className="text-lg font-semibold text-primary">{result.birthDay}</p>
                 </div>
              </>
            ) : (
              <p className="text-muted-foreground text-center">
                Enter your date of birth to see your age.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
