"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FlaskConical } from 'lucide-react';

export default function ScientificCalculator() {

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
            <div className="mx-auto bg-primary/20 p-3 rounded-full">
             <FlaskConical className="h-8 w-8 text-primary" />
            </div>
          <CardTitle className="mt-4">Scientific Calculator Coming Soon!</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            We are currently building a powerful scientific calculator with advanced functions. Please check back later.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
