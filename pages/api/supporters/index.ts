import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { Supporter } from 'types/supporter';

function parseCSV(csvContent: string): Supporter[] {
  const lines = csvContent.trim().split('\n');
  const supporters: Supporter[] = [];

  // Skip header (first line)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse CSV line considering quoted fields
    const matches = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
    if (!matches || matches.length < 5) continue;

    const [name, coffees, price, currency, date] = matches.map((field) =>
      field.replace(/^"(.*)"$/, '$1').trim()
    );

    supporters.push({
      support_id: `${i}`,
      supporter_name: name,
      support_coffees: parseInt(coffees, 10),
      support_coffee_price: parseFloat(price),
      currency: currency,
      support_created_on: date,
    });
  }

  return supporters;
}

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const csvPath = path.join(
      process.cwd(),
      'pages',
      'api',
      'supporters',
      'list.csv'
    );
    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    const supporters = parseCSV(csvContent);

    res.status(200).json({
      total: supporters.length,
      supporters,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error reading supporters:', error);
    res.status(500).json({ error: 'Error reading supporters' });
  }
}
