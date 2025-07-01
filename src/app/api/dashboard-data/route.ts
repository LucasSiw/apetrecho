import { NextResponse } from 'next/server';
import { getDashboardData as _getDashboardData } from '@/lib/actions/attdashaluguel';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = parseInt(searchParams.get('userId') || '', 10);

  if (isNaN(userId)) {
    return NextResponse.json({ message: 'User ID is missing or invalid.' }, { status: 400 });
  }

  try {
    let responseData: any = {};
    let responseStatus: number = 200;

    const mockRes = {
      status: (status: number) => {
        responseStatus = status;
        return {
          json: (data: any) => {
            responseData = data;
          },
        };
      },
      headersSent: false,
    };

    await _getDashboardData({ user: { id: userId } }, mockRes as any);

    return NextResponse.json(responseData, { status: responseStatus });

  } catch (error) {
    console.error("Error fetching dashboard data in App Router API route:", error);
    return NextResponse.json({ message: "Internal Server Error loading dashboard data." }, { status: 500 });
  }
}