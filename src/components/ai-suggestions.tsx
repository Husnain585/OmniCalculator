"use client";

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { suggestCalculatorsBasedOnUsage } from '@/ai/flows/suggest-calculators-based-on-usage';
import { Lightbulb, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { allCalculators, calculatorCategories } from '@/lib/calculators';
import { Skeleton } from './ui/skeleton';

export default function AiSuggestions() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSuggestions() {
      try {
        setLoading(true);
        // In a real app, these would come from user data and analytics
        const pastUsage = 'BMI Calculator';
        const trendingCalculators =
          'Simple Interest, Mortgage Calculator';

        const result = await suggestCalculatorsBasedOnUsage({
          pastUsage,
          trendingCalculators,
        });
        const suggestedNames = result.suggestedCalculators
          .split(',')
          .map((s) => s.trim());
        setSuggestions(suggestedNames);
      } catch (error) {
        console.error('Failed to fetch AI suggestions:', error);
        // Set some default suggestions on error
        setSuggestions(['Simple Interest', 'BMI Calculator']);
      } finally {
        setLoading(false);
      }
    }

    fetchSuggestions();
  }, []);

  const suggestedCalculators = allCalculators.filter((calc) =>
    suggestions.includes(calc.name)
  );

  return (
    <section>
      <h2 className="text-3xl font-bold font-headline mb-4 flex items-center gap-2">
        <Lightbulb className="text-primary" />
        Suggested For You
      </h2>
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {suggestedCalculators.slice(0, 3).map((calc) => {
            const category = allCalculators.find((c) => c.name === calc.name)
              ? calculatorCategories.find((cat) =>
                  cat.calculators.some((c) => c.name === calc.name)
                )
              : undefined;
            if (!category) return null;

            return (
              <Link
                key={calc.slug}
                href={`/calculators/${category.slug}/${calc.slug}`}
              >
                <Card className="group h-full transition-all hover:bg-card/90 hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <calc.icon className="h-6 w-6 text-muted-foreground" />
                        {calc.name}
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{calc.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
