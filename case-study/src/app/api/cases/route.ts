import { NextRequest, NextResponse } from 'next/server';
import CourtListenerAPI from '@/lib/court-listener-api';

// Initialize Court Listener API with token
const courtListener = new CourtListenerAPI(
  process.env.COURTLISTENER_API_KEY!
);

// Helper function to determine jurisdiction from court code
function getJurisdictionFromCourt(courtCode: string): string {
  if (!courtCode) return 'Unknown';

  const code = courtCode.toLowerCase();

  // Federal courts
  if (code === 'scotus') return 'Federal (Supreme Court)';
  if (code.startsWith('ca')) return 'Federal (Circuit Court)';
  if (code.startsWith('d')) return 'Federal (District Court)';
  if (code === 'com' || code === 'ccpa') return 'Federal (Commerce)';
  if (code === 'cafc') return 'Federal (Circuit - Federal)';
  if (code === 'cavc') return 'Federal (Veterans Appeals)';
  if (code === 'cusc') return 'Federal (Customs)';
  if (code === 'bap') return 'Federal (Bankruptcy Appellate)';
  if (code === 'b') return 'Federal (Bankruptcy)';
  if (code === 'mc') return 'Federal (Military Court)';
  if (code === 'tax') return 'Federal (Tax Court)';

  // State courts
  return 'State';
}

// Helper function to get readable court name
function getCourtName(courtCode: string): string {
  if (!courtCode) return 'Unknown Court';

  const courtNames: Record<string, string> = {
    'scotus': 'Supreme Court of the United States',
    'ca1': 'U.S. Court of Appeals for the First Circuit',
    'ca2': 'U.S. Court of Appeals for the Second Circuit',
    'ca3': 'U.S. Court of Appeals for the Third Circuit',
    'ca4': 'U.S. Court of Appeals for the Fourth Circuit',
    'ca5': 'U.S. Court of Appeals for the Fifth Circuit',
    'ca6': 'U.S. Court of Appeals for the Sixth Circuit',
    'ca7': 'U.S. Court of Appeals for the Seventh Circuit',
    'ca8': 'U.S. Court of Appeals for the Eighth Circuit',
    'ca9': 'U.S. Court of Appeals for the Ninth Circuit',
    'ca10': 'U.S. Court of Appeals for the Tenth Circuit',
    'ca11': 'U.S. Court of Appeals for the Eleventh Circuit',
    'cadc': 'U.S. Court of Appeals for the D.C. Circuit',
    'cafc': 'U.S. Court of Appeals for the Federal Circuit',
    'tax': 'U.S. Tax Court',
    'cc': 'U.S. Court of Claims',
  };

  return courtNames[courtCode.toLowerCase()] || courtCode;
}

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
        .filter(cluster => cluster.cluster_id) // Filter out any without cluster IDs
        .map((cluster, index) => ({
          id: `cl-${cluster.cluster_id}-${index}`, // Ensure unique ID using cluster_id and index
          title: cluster.caseName || cluster.caseNameFull || 'Untitled Case',
          citation: cluster.citation && cluster.citation.length > 0 ? cluster.citation[0] : cluster.neutralCite || 'No citation available',
          court: getCourtName(cluster.court) || 'Unknown Court',
          date: cluster.dateFiled || new Date().toISOString(),
          jurisdiction: getJurisdictionFromCourt(cluster.court),
          topics: [cluster.status].filter(Boolean),
          summary: cluster.syllabus || cluster.procedural_history || (cluster.opinions && cluster.opinions[0] && cluster.opinions[0].snippet) || 'Summary not available. Click "View Full Case" to read the complete decision.',
          source: 'courtlistener' as const,
          url: `https://www.courtlistener.com${cluster.absolute_url}`,
          fullTextAvailable: cluster.opinions && cluster.opinions.length > 0
        })),
      total: typeof results.count === 'number' ? results.count : 0,
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
        .filter(cluster => cluster.cluster_id) // Filter out any without cluster IDs
        .map((cluster, index) => ({
          id: `cl-${cluster.cluster_id}-${index}`, // Ensure unique ID using cluster_id and index
          title: cluster.caseName || cluster.caseNameFull || 'Untitled Case',
          citation: cluster.citation && cluster.citation.length > 0 ? cluster.citation[0] : cluster.neutralCite || 'No citation available',
          court: getCourtName(cluster.court) || 'Unknown Court',
          date: cluster.dateFiled || new Date().toISOString(),
          jurisdiction: getJurisdictionFromCourt(cluster.court),
          topics: [cluster.status].filter(Boolean),
          summary: cluster.syllabus || cluster.procedural_history || (cluster.opinions && cluster.opinions[0] && cluster.opinions[0].snippet) || 'Summary not available. Click "View Full Case" to read the complete decision.',
          source: 'courtlistener' as const,
          url: `https://www.courtlistener.com${cluster.absolute_url}`,
          fullTextAvailable: cluster.opinions && cluster.opinions.length > 0
        })),
      total: typeof results.count === 'number' ? results.count : 0,
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
