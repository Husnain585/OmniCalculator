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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calculator as CalculatorIcon, Lightbulb } from 'lucide-react';
import { suggestNextStep } from '@/ai/flows/suggest-next-step';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  age: z.coerce.number().int().positive('Age must be a positive number'),
  gender: z.enum(['male', 'female']),
  height: z.coerce.number().positive('Height must be positive'),
  weight: z.coerce.number().positive('Weight must be positive'),
  activityLevel: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
  maintenance: number;
  mildLoss: number;
  weightLoss: number;
  extremeLoss: number;
}

const activityMultipliers: { [key: string]: number } = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  extra: 1.9,
};

export default function CalorieCalculator() {
  const [result, setResult] = useState<Result | null>(null);
  const [suggestion, setSuggestion] = useState('');
  const [suggestionLoading, setSuggestionLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: 'male',
      activityLevel: 'sedentary',
      age: undefined,
      height: undefined,
      weight: undefined,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { age, gender, height, weight, activityLevel } = data;
    
    let bmr: number;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const maintenance = bmr * activityMultipliers[activityLevel];

    setResult({
      maintenance: Math.round(maintenance),
      mildLoss: Math.round(maintenance - 250),
      weightLoss: Math.round(maintenance - 500),
      extremeLoss: Math.round(maintenance - 1000),
    });

    setSuggestionLoading(true);
    setSuggestion('');
    try {
      const res = await suggestNextStep({ calculatorName: 'Calorie Calculator' });
      setSuggestion(res.suggestion);
    } catch (error) {
      console.error('Failed to get AI suggestion:', error);
      setSuggestion("Remember to listen to your body. These numbers are estimates; adjust based on your progress and energy levels.");
    } finally {
      setSuggestionLoading(false);
    }
  };

  const resetCalculator = () => {
    form.reset({
      gender: 'male',
      activityLevel: 'sedentary',
      age: undefined,
      height: undefined,
      weight: undefined,
    });
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="e.g., 25" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
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
                </div>
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
                        name="weight"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Weight (kg)</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="e.g., 75" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="activityLevel"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Activity Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select your daily activity level" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                                <SelectItem value="light">Lightly active (light exercise/sports 1-3 days/week)</SelectItem>
                                <SelectItem value="moderate">Moderately active (moderate exercise/sports 3-5 days/week)</SelectItem>
                                <SelectItem value="active">Very active (hard exercise/sports 6-7 days a week)</SelectItem>
                                <SelectItem value="extra">Extra active (very hard exercise/sports & physical job)</SelectItem>
                            </SelectContent>
                        </Select>
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
            <CardTitle>Daily Calorie Needs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {result ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Maintenance</p>
                  <p className="text-2xl font-bold text-primary">{result.maintenance.toLocaleString()} calories/day</p>
                </div>
                 <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="font-semibold text-lg">{result.mildLoss.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Mild Weight Loss</p>
                        <p className="text-xs text-muted-foreground">(0.25 kg/week)</p>
                    </div>
                     <div>
                        <p className="font-semibold text-lg">{result.weightLoss.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Weight Loss</p>
                        <p className="text-xs text-muted-foreground">(0.5 kg/week)</p>
                    </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center">
                Enter your details for an estimate of your daily needs.
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
