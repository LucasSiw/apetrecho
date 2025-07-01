import type { NextApiRequest, NextApiResponse } from 'next';
import { getDashboardData as _getDashboardData } from '@/lib/actions/attdashaluguel';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const userId = parseInt(req.query.userId as string, 10);

  if (isNaN(userId)) {
    return res.status(400).json({ message: 'User ID is missing or invalid.' });
  }

  try {
    await _getDashboardData({ user: { id: userId } }, res as any);
  } catch (error) {
    console.error("Error fetching dashboard data in API route:", error);
    if (!res.headersSent) { 
      res.status(500).json({ message: "Internal Server Error loading dashboard data." });
    }
  }
}