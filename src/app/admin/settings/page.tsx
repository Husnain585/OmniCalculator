import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { allCalculators } from '@/lib/calculators';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold font-headline">Admin Settings</h1>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Calculator Management</CardTitle>
              <CardDescription>
                View all calculators currently available in the application.
              </CardDescription>
            </div>
            <Button disabled> {/* Disabled as functionality is not implemented */}
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Calculator
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Slug</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allCalculators.map((calc) => (
                <TableRow key={calc.slug}>
                  <TableCell className="font-medium">{calc.name}</TableCell>
                  <TableCell>
                    {
                      // Find category name from slug
                      (
                        Object.values(allCalculators).find(c => c.slug === calc.slug) &&
                        (
                          (allCalculators.find(c => c.slug === calc.slug) as any)
                            .categorySlug || 'N/A'
                        )
                      ) || 'Unknown'
                    }
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {calc.slug}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
