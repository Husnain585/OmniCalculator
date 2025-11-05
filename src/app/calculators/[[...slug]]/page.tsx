import Link from 'next/link';
import { notFound } from 'next/navigation';
import { calculatorCategories, allCalculators } from '@/lib/calculators';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ArrowRight } from 'lucide-react';

export default function CalculatorPage({
  params,
}: {
  params: { slug: string[] };
}) {
  const { slug } = params;

  // /calculators - All categories page
  if (!slug || slug.length === 0) {
    return (
      <div>
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Calculators</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-4xl font-bold font-headline mb-8">
          All Calculators
        </h1>
        <div className="space-y-10">
          {calculatorCategories.map((category) => (
            <div key={category.slug}>
              <h2 className="text-2xl font-bold font-headline mb-4">
                {category.name}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {category.calculators.map((calc) => (
                  <Link
                    key={calc.slug}
                    href={`/calculators/${category.slug}/${calc.slug}`}
                  >
                    <Card className="group h-full transition-all hover:bg-card/90 hover:shadow-md">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <calc.icon className="h-6 w-6 text-muted-foreground" />
                          {calc.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>{calc.description}</CardDescription>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
                {category.calculators.length === 0 && (
                  <p className="text-muted-foreground col-span-full">
                    More calculators coming soon.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // /calculators/[category] - Category page
  if (slug.length === 1) {
    const category = calculatorCategories.find((cat) => cat.slug === slug[0]);
    if (!category) notFound();

    return (
      <div>
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/calculators">Calculators</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{category.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mb-8 text-center">
            <category.icon className="h-12 w-12 text-primary mb-4 inline-block" />
            <h1 className="text-4xl font-bold text-foreground font-headline">
              {category.name}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              {category.description}
            </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {category.calculators.map((calc) => (
            <Link
              key={calc.slug}
              href={`/calculators/${category.slug}/${calc.slug}`}
            >
              <Card className="group flex flex-col justify-between h-full transition-shadow hover:shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <calc.icon className="h-6 w-6 text-primary" />
                    <span>{calc.name}</span>
                  </CardTitle>
                  <CardDescription>{calc.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-semibold text-primary flex items-center">
                    Calculate Now{' '}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {category.calculators.length === 0 && (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardContent className="p-10 text-center">
                <p className="text-muted-foreground">
                  Calculators for this category are being built. Check back
                  soon!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // /calculators/[category]/[calculator] - Individual calculator page
  if (slug.length === 2) {
    const category = calculatorCategories.find((cat) => cat.slug === slug[0]);
    const calculator = allCalculators.find((calc) => calc.slug === slug[1]);
    if (!calculator || !category || !category.calculators.includes(calculator))
      notFound();

    const CalculatorComponent = calculator.component;

    return (
      <div>
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/calculators">Calculators</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/calculators/${category.slug}`}>
                {category.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{calculator.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-headline">
            {calculator.name}
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            {calculator.description}
          </p>
        </div>
        <CalculatorComponent />
      </div>
    );
  }

  notFound();
}
