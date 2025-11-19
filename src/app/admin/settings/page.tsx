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
import { allCalculators } from '@/lib/calculators-db';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default async function AdminSettingsPage() {
  const calculators = await allCalculators();
  
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold font-headline">Admin Settings</h1>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Calculator Management</CardTitle>
              <CardDescription>
                View all calculators currently available in the application from Firestore.
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
              {calculators.map((calc) => (
                <TableRow key={calc.slug}>
                  <TableCell className="font-medium">{calc.name}</TableCell>
                  <TableCell>
                    {calc.categorySlug || 'N/A'}
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
