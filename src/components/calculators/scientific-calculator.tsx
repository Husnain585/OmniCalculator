"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { evaluate } from 'mathjs';

const buttonLayout = [
  ['(', ')', '%', 'AC'],
  ['sin', 'cos', 'tan', 'ln'],
  ['7', '8', '9', '/'],
  ['4', '5', '6', '*'],
  ['1', '2', '3', '-'],
  ['0', '.', '=', '+'],
];

export default function ScientificCalculator() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');

  const handleButtonClick = (value: string) => {
    if (value === 'AC') {
      setInput('');
      setResult('');
    } else if (value === '=') {
      try {
        // Replace percentage
        const expression = input.replace(/%/g, '/100');
        const evalResult = evaluate(expression);
        setResult(evalResult.toString());
      } catch (error) {
        setResult('Error');
      }
    } else {
      setInput((prev) => prev + value);
    }
  };

  return (
    <div className="flex justify-center items-center">
        <Card className="w-full max-w-sm mx-auto shadow-lg">
        <CardContent className="p-4">
            <div className="bg-muted rounded-lg p-4 mb-4 text-right">
                <div className="text-muted-foreground text-sm h-6 truncate">{input || "0"}</div>
                <div className="text-foreground text-4xl font-bold h-12 truncate">{result || (input || "0")}</div>
            </div>

            <div className="grid grid-cols-4 gap-2">
            {buttonLayout.flat().map((btn) => (
                <Button
                    key={btn}
                    onClick={() => handleButtonClick(btn)}
                    variant={
                        ['/', '*', '-', '+', '='].includes(btn) ? 'default' :
                        btn === 'AC' ? 'destructive' :
                        'secondary'
                    }
                    className="h-16 text-xl"
                >
                {btn}
                </Button>
            ))}
            </div>
        </CardContent>
        </Card>
    </div>
  );
}