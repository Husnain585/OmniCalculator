// A script to seed the Firestore database with initial calculator data.
// To run: `npm run db:seed`
// Make sure you have configured your Firebase Admin credentials in `.env`
import 'dotenv/config';
import { db } from './firebase-admin'; // Use admin db for seeding
import { collection, writeBatch, getDocs, doc } from 'firebase/firestore';
import { initialCalculators, initialCalculatorData } from './calculators';

async function seedDatabase() {
  console.log('Starting to seed the database...');

  const calculatorsCol = collection(db, 'calculators');
  const categoriesCol = collection(db, 'calculator_categories');

  // Check if collections are empty before seeding
  const calculatorsSnapshot = await getDocs(calculatorsCol);
  const categoriesSnapshot = await getDocs(categoriesCol);

  if (!calculatorsSnapshot.empty || !categoriesSnapshot.empty) {
    console.log('Database already contains data. Aborting seed.');
    return;
  }

  const batch = writeBatch(db);

  // Seed categories
  initialCalculatorData.forEach((category) => {
    const categoryRef = doc(categoriesCol, category.slug);
    const { icon, ...rest } = category;
    batch.set(categoryRef, {
        ...rest,
        icon: icon.displayName || 'Calculator'
    });
  });
  console.log(`${initialCalculatorData.length} categories queued for seeding.`);

  // Seed calculators
  initialCalculators.forEach((calculator) => {
    const calcRef = doc(calculatorsCol, calculator.slug);
    const { componentName, iconName, ...rest } = calculator as any;
    batch.set(calcRef, {
        ...rest,
        component: componentName,
        icon: iconName
    });
  });
  console.log(`${initialCalculators.length} calculators queued for seeding.`);

  try {
    await batch.commit();
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase().then(() => {
    console.log('Seed script finished.');
    process.exit(0);
}).catch(err => {
    console.error('Seed script failed:', err);
    process.exit(1);
});
