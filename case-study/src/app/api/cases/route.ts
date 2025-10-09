import { NextRequest, NextResponse } from 'next/server';
import CourtListenerAPI from '@/lib/court-listener-api';

// Initialize Court Listener API with token
const courtListener = new CourtListenerAPI(
  process.env.COURTLISTENER_API_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('q') || '';
    const court = searchParams.get('court') || undefined;
    const status = searchParams.get('status') || undefined;
    const startDate = searchParams.get('start_date') || undefined;
    const endDate = searchParams.get('end_date') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20');

    // Validate parameters
    if (limit > 20) {
      return NextResponse.json(
        { error: 'Limit cannot exceed 20 for search API' },
        { status: 400 }
      );
    }

    // Build search parameters for Court Listener
    const searchParams_cl: any = {
      q: query,
      page_size: limit
    };

    // Add court filter if specified
    if (court) {
      searchParams_cl.court = court;
    }

    // Add status filter if specified
    if (status && status !== 'all') {
      searchParams_cl.status = status;
    }

    // Add date filters if specified
    if (startDate) {
      searchParams_cl.filed_after = startDate;
    }
    if (endDate) {
      searchParams_cl.filed_before = endDate;
    }

    // Search cases using Court Listener
    const results = await courtListener.searchCases(searchParams_cl);

    // Transform the results to a simpler format
    const transformedResults = {
      cases: results.results
        .filter(cluster => cluster.id) // Filter out any without IDs
        .map((cluster) => ({
          id: `cl-${cluster.id}`, // Use cluster ID
          title: cluster.case_name || cluster.case_name_short || 'Untitled Case',
          citation: cluster.case_name_short || 'No citation available',
          court: 'Court Listener',
          date: cluster.date_filed || cluster.date_created || new Date().toISOString(),
          jurisdiction: cluster.precedential_status === 'Published' ? 'Federal' : 'State',
          topics: [cluster.precedential_status].filter(Boolean),
          summary: cluster.summary || cluster.syllabus || cluster.headnotes || 'Summary not available. Click "View Full Case" to read the complete decision.',
          source: 'courtlistener' as const,
          url: `https://www.courtlistener.com${cluster.absolute_url}`,
          fullTextAvailable: cluster.sub_opinions && cluster.sub_opinions.length > 0
        })),
      total: typeof results.count === 'number' ? results.count : parseInt(results.count as string) || 0,
      hasMore: !!results.next
    };

    return NextResponse.json(transformedResults);
  } catch (error) {
    console.error('Cases API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      query,
      court,
      status,
      startDate,
      endDate,
      limit = 20
    } = body;

    // Build search parameters for Court Listener
    const searchParams_cl: any = {
      q: query,
      page_size: Math.min(limit, 20)
    };

    // Add court filter if specified
    if (court) {
      searchParams_cl.court = court;
    }

    // Add status filter if specified
    if (status && status !== 'all') {
      searchParams_cl.status = status;
    }

    // Add date filters if specified
    if (startDate) {
      searchParams_cl.filed_after = startDate;
    }
    if (endDate) {
      searchParams_cl.filed_before = endDate;
    }

    // Search cases using Court Listener
    const results = await courtListener.searchCases(searchParams_cl);

    // Transform the results to a simpler format
    const transformedResults = {
      cases: results.results
        .filter(cluster => cluster.id) // Filter out any without IDs
        .map((cluster) => ({
          id: `cl-${cluster.id}`, // Use cluster ID
          title: cluster.case_name || cluster.case_name_short || 'Untitled Case',
          citation: cluster.case_name_short || 'No citation available',
          court: 'Court Listener',
          date: cluster.date_filed || cluster.date_created || new Date().toISOString(),
          jurisdiction: cluster.precedential_status === 'Published' ? 'Federal' : 'State',
          topics: [cluster.precedential_status].filter(Boolean),
          summary: cluster.summary || cluster.syllabus || cluster.headnotes || 'Summary not available. Click "View Full Case" to read the complete decision.',
          source: 'courtlistener' as const,
          url: `https://www.courtlistener.com${cluster.absolute_url}`,
          fullTextAvailable: cluster.sub_opinions && cluster.sub_opinions.length > 0
        })),
      total: typeof results.count === 'number' ? results.count : parseInt(results.count as string) || 0,
      hasMore: !!results.next
    };

    return NextResponse.json(transformedResults);
  } catch (error) {
    console.error('Cases API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
