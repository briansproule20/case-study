// Court Listener API Service - Simplified
// Documentation: https://www.courtlistener.com/api/rest/v4/

export interface CourtListenerCase {
  id: number;
  resource_uri: string;
  absolute_url: string;
  cluster: number;
  author: number | null;
  per_curiam: boolean;
  joined_by: number[];
  date_created: string;
  date_modified: string;
  author_str: string;
  per_curiam_str: string;
  joined_by_str: string;
  type: string;
  sha1: string;
  page_count: number | null;
  download_url: string | null;
  local_path: string;
  plain_text: string;
  html: string;
  html_lawbox: string;
  html_columbia: string;
  html_anon_2020: string;
  xml_harvard: string;
  html_with_citations: string;
  extracted_by_ocr: boolean;
}

export interface CourtListenerCluster {
  id: number;
  resource_uri: string;
  absolute_url: string;
  panel: number[];
  non_participating_judges: number[];
  docket: number;
  sub_opinions: CourtListenerCase[];
  date_created: string;
  date_modified: string;
  judges: string;
  date_filed: string;
  date_filed_is_approximate: boolean;
  slug: string;
  case_name_short: string;
  case_name: string;
  case_name_full: string;
  scdb_id: string;
  scdb_decision_direction: number | null;
  scdb_votes_majority: number | null;
  scdb_votes_minority: number | null;
  source: string;
  procedural_history: string;
  attorneys: string;
  nature_of_suit: string;
  posture: string;
  syllabus: string;
  headnotes: string;
  summary: string;
  disposition: string;
  history: string;
  other_dates: string;
  cross_reference: string;
  correction: string;
  citation_count: number;
  precedential_status: string;
  date_blocked: string | null;
  blocked: boolean;
  citation_id: number;
}

// Search results have a different format than cluster detail endpoints
export interface CourtListenerSearchResult {
  cluster_id: number;
  caseName: string;
  caseNameFull: string;
  citation: string[];
  neutralCite: string;
  court: string;
  dateFiled: string;
  status: string;
  syllabus: string;
  procedural_history: string;
  opinions: Array<{ snippet: string }>;
  absolute_url: string;
}

export interface CourtListenerSearchResponse {
  count: string | number;
  next: string | null;
  previous: string | null;
  results: CourtListenerSearchResult[];
}

export interface CourtListenerDocket {
  id: number;
  resource_uri: string;
  absolute_url: string;
  court: string;
  clusters: number[];
  audio_files: number[];
  assigned_to: number | null;
  referred_to: number | null;
  date_created: string;
  date_modified: string;
  source: number;
  appeal_from: number | null;
  appeal_from_str: string;
  originating_court_information: string;
  date_cert_granted: string | null;
  date_cert_denied: string | null;
  date_argued: string | null;
  date_reargued: string | null;
  date_reargument_denied: string | null;
  date_filed: string | null;
  date_terminated: string | null;
  date_last_filing: string | null;
  case_name_short: string;
  case_name: string;
  case_name_full: string;
  slug: string;
  docket_number: string;
  docket_number_core: string;
  pacer_case_id: string;
  cause: string;
  nature_of_suit: string;
  jury_demand: string;
  jurisdiction_type: string;
  appellate_fee_status: string;
  appellate_case_type_information: string;
  mdl_status: string;
  filepath_local: string;
  filepath_ia: string;
  filepath_ia_json: string;
  ia_upload_failure_count: number | null;
  ia_needs_upload: boolean | null;
  ia_date_first_change: string | null;
  view_count: number;
  date_blocked: string | null;
  blocked: boolean;
}

class CourtListenerAPI {
  private baseURL = 'https://www.courtlistener.com/api/rest/v4';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Token ${this.apiKey}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Court Listener API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Search for case clusters (main search functionality)
  async searchCases(params: {
    q?: string; // Search query
    court?: string; // Court ID (e.g., 'scotus', 'ca1', 'ca2')
    filed_after?: string; // Date in YYYY-MM-DD format
    filed_before?: string; // Date in YYYY-MM-DD format
    precedential_status?: 'Published' | 'Unpublished' | 'Errata' | 'Separate' | 'In-chambers' | 'Relating-to' | 'Unknown';
    page_size?: number; // Results per page (max 20 for search)
    order_by?: string; // Ordering field
  } = {}): Promise<CourtListenerSearchResponse> {
    // Add type=o to search for opinions
    const searchParams = { ...params, type: 'o' };
    return this.makeRequest<CourtListenerSearchResponse>('/search/', searchParams);
  }

  // Get specific case cluster by ID
  async getCluster(id: number): Promise<CourtListenerCluster> {
    return this.makeRequest<CourtListenerCluster>(`/clusters/${id}/`);
  }

  // Get specific opinion by ID
  async getOpinion(id: number): Promise<CourtListenerCase> {
    return this.makeRequest<CourtListenerCase>(`/opinions/${id}/`);
  }

  // Get docket information
  async getDocket(id: number): Promise<CourtListenerDocket> {
    return this.makeRequest<CourtListenerDocket>(`/dockets/${id}/`);
  }

  // Get cases by citation
  async searchByCitation(citation: string): Promise<CourtListenerSearchResponse> {
    return this.searchCases({ q: `citation:"${citation}"` });
  }

  // Get cases by case name
  async searchByCaseName(caseName: string): Promise<CourtListenerSearchResponse> {
    return this.searchCases({ q: `caseName:"${caseName}"` });
  }

  // Get recent cases from a specific court
  async getRecentCases(court: string, limit: number = 10): Promise<CourtListenerSearchResponse> {
    return this.searchCases({
      court,
      order_by: '-date_filed',
      page_size: Math.min(limit, 20)
    });
  }

  // Get cases by topic/keyword
  async searchByTopic(topic: string, court?: string): Promise<CourtListenerSearchResponse> {
    return this.searchCases({
      q: topic,
      court,
      order_by: '-date_filed'
    });
  }
}

export default CourtListenerAPI;
