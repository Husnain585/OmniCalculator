// A script to seed the Firestore database with initial calculator data.
// To run: `npm run db:seed`
// Make sure you have configured your Firebase Admin credentials in `.env`

import { db } from './firebase';
import { collection, writeBatch, getDocs } from 'firebase/firestore';
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
    const categoryDoc = doc(categoriesCol, category.slug);
    // We don't want to store the icon component itself
    const { icon, ...rest } = category;
    batch.set(categoryDoc, {
        ...rest,
        icon: icon.displayName || 'Calculator'
    });
  });

  // Seed calculators
  initialCalculators.forEach((calculator) => {
    const calcDoc = doc(calculatorsCol, calculator.slug);
    // We don't want to store the component and icon React components
    const { componentName, iconName, ...rest } = calculator as any;
    batch.set(calcDoc, {
        ...rest,
        component: componentName,
        icon: iconName
    });
  });

  try {
    await batch.commit();
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();
