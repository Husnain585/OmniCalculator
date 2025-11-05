import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { calculatorCategories } from '@/lib/calculators';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import AiSuggestions from '@/components/ai-suggestions';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

function CategoryCard({
  category,
}: {
  category: (typeof calculatorCategories)[0];
}) {
  const image = PlaceHolderImages.find((img) => img.id === category.image.id);

  return (
    <Link href={`/calculators/${category.slug}`}>
      <Card className="group h-full overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="p-0">
          <div className="relative h-40 w-full">
            {image && (
              <Image
                src={image.imageUrl}
                alt={image.description}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                data-ai-hint={image.imageHint}
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <category.icon className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl">{category.name}</CardTitle>
          </div>
          <CardDescription className="mt-2">
            {category.description}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl font-headline">
          Welcome to OmniCalc
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Your one-stop destination for hundreds of free online calculators.
        </p>
      </section>

      <section>
        <AiSuggestions />
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold font-headline">
            Calculator Categories
          </h2>
          <Button variant="link" asChild>
            <Link href="/calculators">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {calculatorCategories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </section>
    </div>
  );
}
