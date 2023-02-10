import prompts from 'prompts';
import { connectToDatabase } from './database/connection';
import City from './database/models/City';
import { runCityPerformanceTest } from './PerformanceTest';
import { generateCityWorkLoad } from './WorkLoadGenerator';

const start = async () => {
  const response = await prompts({
    type: 'select',
    name: 'action',
    message: 'What do you want to do?',
    choices: [
      { title: 'Start performance test', description: 'Run the performance test with the latest test data', value: 'start' },
      { title: 'Regenerate test data', description: 'Loads test data into the database', value: 'generate' },
    ],
    initial: 0
  });

  await connectToDatabase();
    
  if (response.action === "start") {
    await runCityPerformanceTest();
  } else if (response.action === "generate") {
    await City.sync({ force: true, logging: false });
    console.info("💧 Dropped existing data");
    await generateCityWorkLoad();
  }

  process.exit(0);
};

start();