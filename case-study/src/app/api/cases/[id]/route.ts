import { NextRequest, NextResponse } from 'next/server';
import CourtListenerAPI from '@/lib/court-listener-api';

// Initialize Court Listener API with token
const courtListener = new CourtListenerAPI(
  process.env.COURTLISTENER_API_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Case ID is required' },
        { status: 400 }
      );
    }

    // Extract cluster ID from our format (cl-123)
    if (!id.startsWith('cl-')) {
      return NextResponse.json(
        { error: 'Invalid case ID format' },
        { status: 400 }
      );
    }

    const clusterId = parseInt(id.replace('cl-', ''));
    
    // Get case cluster by ID
    const cluster = await courtListener.getCluster(clusterId);

    if (!cluster) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Transform to our format
    const transformedCase = {
      id: `cl-${cluster.id}`,
      title: cluster.case_name || cluster.case_name_short || 'Untitled Case',
      citation: cluster.case_name_short || cluster.case_name || 'No citation available',
      court: cluster.court || 'Unknown Court',
      date: cluster.date_filed || cluster.date_created || new Date().toISOString(),
      jurisdiction: cluster.precedential_status === 'Published' ? 'Federal' : 'State',
      topics: [cluster.precedential_status].filter(Boolean),
      summary: cluster.summary || cluster.syllabus || cluster.headnotes || 'Summary not available. View the full case on Court Listener for complete details.',
      source: 'courtlistener' as const,
      url: `https://www.courtlistener.com${cluster.absolute_url}` || cluster.absolute_url,
      fullTextAvailable: cluster.sub_opinions && cluster.sub_opinions.length > 0
    };

    return NextResponse.json(transformedCase);
  } catch (error) {
    console.error('Case lookup API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
