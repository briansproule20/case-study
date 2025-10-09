'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, BookOpen, Calendar, MapPin, Scale, Loader2, X, ChevronDown, SlidersHorizontal, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CaseSearchResponse {
  cases: Array<{
    id: string;
    title: string;
    citation: string;
    court: string;
    date: string;
    jurisdiction: string;
    topics: string[];
    summary: string;
    source: 'courtlistener' | 'harvard-cap';
    url?: string;
    fullTextAvailable: boolean;
  }>;
  total: number;
  hasMore: boolean;
}

// Filter options data
const courtLevels = [
  { value: 'all', label: 'All Courts' },
  { value: 'scotus', label: 'Supreme Court' },
  { value: 'circuit', label: 'Circuit Courts' },
  { value: 'district', label: 'District Courts' },
  { value: 'state-supreme', label: 'State Supreme Courts' },
  { value: 'state-appellate', label: 'State Appellate Courts' },
  { value: 'specialty', label: 'Specialty Courts' },
];

const publicationStatus = [
  { value: 'all', label: 'All Status' },
  { value: 'Published', label: 'Published' },
  { value: 'Unpublished', label: 'Unpublished' },
  { value: 'Errata', label: 'Errata' },
  { value: 'Separate', label: 'Separate Opinion' },
];

const dateRanges = [
  { value: 'all', label: 'All Time' },
  { value: 'last-year', label: 'Last Year' },
  { value: 'last-5-years', label: 'Last 5 Years' },
  { value: 'last-10-years', label: 'Last 10 Years' },
  { value: 'last-20-years', label: 'Last 20 Years' },
];

const legalAreas = [
  { value: 'all', label: 'All Legal Areas' },
  { 
    category: 'Constitutional Law',
    options: [
      { value: 'first-amendment', label: 'First Amendment' },
      { value: 'due-process', label: 'Due Process' },
      { value: 'equal-protection', label: 'Equal Protection' },
      { value: 'commerce-clause', label: 'Commerce Clause' },
    ]
  },
  {
    category: 'Criminal Law',
    options: [
      { value: 'fourth-amendment', label: 'Fourth Amendment' },
      { value: 'fifth-amendment', label: 'Fifth Amendment' },
      { value: 'sixth-amendment', label: 'Sixth Amendment' },
      { value: 'sentencing', label: 'Sentencing' },
    ]
  },
  {
    category: 'Civil Rights',
    options: [
      { value: 'employment-discrimination', label: 'Employment Discrimination' },
      { value: 'housing-rights', label: 'Housing Rights' },
      { value: 'voting-rights', label: 'Voting Rights' },
      { value: 'disability-rights', label: 'Disability Rights' },
    ]
  },
  {
    category: 'Business Law',
    options: [
      { value: 'contract-law', label: 'Contract Law' },
      { value: 'corporate-law', label: 'Corporate Law' },
      { value: 'securities-law', label: 'Securities Law' },
      { value: 'antitrust', label: 'Antitrust' },
    ]
  },
  {
    category: 'Other Areas',
    options: [
      { value: 'family-law', label: 'Family Law' },
      { value: 'property-law', label: 'Property Law' },
      { value: 'tort-law', label: 'Tort Law' },
      { value: 'administrative-law', label: 'Administrative Law' },
      { value: 'immigration', label: 'Immigration' },
      { value: 'environmental-law', label: 'Environmental Law' },
      { value: 'tax-law', label: 'Tax Law' },
    ]
  }
];

export default function CaseLibraryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedCourtLevel, setSelectedCourtLevel] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedLegalArea, setSelectedLegalArea] = useState('all');
  const [cases, setCases] = useState<CaseSearchResponse['cases']>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Helper function to build search query with filters
  const buildSearchQuery = (baseQuery: string, filters: any) => {
    let searchTerms = [baseQuery.trim()].filter(Boolean);
    
    // Add legal area keywords
    if (filters.legalArea !== 'all') {
      const areaKeywords = {
        'first-amendment': 'first amendment free speech religion',
        'due-process': 'due process procedural substantive',
        'equal-protection': 'equal protection discrimination',
        'commerce-clause': 'commerce clause interstate',
        'fourth-amendment': 'fourth amendment search seizure warrant',
        'fifth-amendment': 'fifth amendment self-incrimination miranda',
        'sixth-amendment': 'sixth amendment counsel jury trial',
        'sentencing': 'sentencing guidelines punishment',
        'employment-discrimination': 'employment discrimination workplace',
        'housing-rights': 'housing discrimination fair housing',
        'voting-rights': 'voting rights election franchise',
        'disability-rights': 'disability ADA accommodation',
        'contract-law': 'contract breach agreement',
        'corporate-law': 'corporate business entity',
        'securities-law': 'securities SEC investment',
        'antitrust': 'antitrust monopoly competition',
        'family-law': 'family custody divorce marriage',
        'property-law': 'property real estate ownership',
        'tort-law': 'tort negligence liability',
        'administrative-law': 'administrative agency regulation',
        'immigration': 'immigration deportation visa',
        'environmental-law': 'environmental EPA pollution',
        'tax-law': 'tax taxation IRS'
      };
      
      if (areaKeywords[filters.legalArea as keyof typeof areaKeywords]) {
        searchTerms.push(areaKeywords[filters.legalArea as keyof typeof areaKeywords]);
      }
    }
    
    // Add topic keywords
    if (filters.topic !== 'all') {
      searchTerms.push(filters.topic);
    }
    
    return searchTerms.join(' ');
  };

  // Helper function to calculate date range
  const getDateRange = (range: string) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    switch (range) {
      case 'last-year':
        return { after: `${currentYear - 1}-01-01`, before: `${currentYear + 1}-01-01` };
      case 'last-5-years':
        return { after: `${currentYear - 5}-01-01`, before: `${currentYear + 1}-01-01` };
      case 'last-10-years':
        return { after: `${currentYear - 10}-01-01`, before: `${currentYear + 1}-01-01` };
      case 'last-20-years':
        return { after: `${currentYear - 20}-01-01`, before: `${currentYear + 1}-01-01` };
      default:
        return {};
    }
  };

  // Enhanced search function with all filters
  const searchCases = async () => {
    const hasAnyFilter = searchQuery.trim() || 
                        selectedTopic !== 'all' ||
                        selectedCourtLevel !== 'all' ||
                        selectedStatus !== 'all' ||
                        selectedDateRange !== 'all' ||
                        selectedLegalArea !== 'all';
    
    if (!hasAnyFilter) {
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const params = new URLSearchParams();
      
      // Build enhanced query
      const enhancedQuery = buildSearchQuery(searchQuery, {
        legalArea: selectedLegalArea,
        topic: selectedTopic
      });
      
      if (enhancedQuery) {
        params.append('q', enhancedQuery);
      }
      
      
      // Add court level filter (map to actual court IDs)
      if (selectedCourtLevel !== 'all') {
        const courtMapping = {
          'scotus': 'scotus',
          'circuit': 'ca1', // We'll use ca1 as example, could be expanded to search multiple
          'district': 'dcd', // DC District Court as example
          'state-supreme': '', // State courts are harder to map generically
          'state-appellate': '',
          'specialty': 'tax' // Tax Court as example
        };
        const courtId = courtMapping[selectedCourtLevel as keyof typeof courtMapping];
        if (courtId) {
          params.append('court', courtId);
        }
      }
      
      // Add publication status filter
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }
      
      // Add date range filter
      const dateRange = getDateRange(selectedDateRange);
      if (dateRange.after) {
        params.append('start_date', dateRange.after);
      }
      if (dateRange.before) {
        params.append('end_date', dateRange.before);
      }
      
      params.append('limit', '20');

      const response = await fetch(`/api/cases?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data: CaseSearchResponse = await response.json();
      setCases(data.cases);
      setTotalCount(data.total);
      
      // Update active filters for display
      updateActiveFilters();
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      setCases([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Update active filters display
  const updateActiveFilters = () => {
    const filters = [];
    if (selectedTopic !== 'all') filters.push(`Topic: ${selectedTopic}`);
    if (selectedCourtLevel !== 'all') filters.push(`Court: ${courtLevels.find(c => c.value === selectedCourtLevel)?.label}`);
    if (selectedStatus !== 'all') filters.push(`Status: ${selectedStatus}`);
    if (selectedDateRange !== 'all') filters.push(`Date: ${dateRanges.find(d => d.value === selectedDateRange)?.label}`);
    if (selectedLegalArea !== 'all') {
      const areaLabel = legalAreas.flatMap(area => 
        'options' in area ? area.options : []
      ).find(option => option?.value === selectedLegalArea)?.label;
      if (areaLabel) filters.push(`Legal Area: ${areaLabel}`);
    }
    setActiveFilters(filters);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedTopic('all');
    setSelectedCourtLevel('all');
    setSelectedStatus('all');
    setSelectedDateRange('all');
    setSelectedLegalArea('all');
    setActiveFilters([]);
  };

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCases();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedTopic, selectedCourtLevel, selectedStatus, selectedDateRange, selectedLegalArea]);

  const handleSearch = () => {
    searchCases();
  };

  const handleExplainInChat = (caseItem: CaseSearchResponse['cases'][0]) => {
    // Build the prompt for the chat
    const prompt = `Please explain this legal case to me:

**${caseItem.title}**

**Citation:** ${caseItem.citation}

**Court:** ${caseItem.court}

**Date:** ${new Date(caseItem.date).toLocaleDateString()}

**Jurisdiction:** ${caseItem.jurisdiction}

**Topics:** ${caseItem.topics.join(', ')}

**Case Summary:** ${caseItem.summary}

**Source:** ${caseItem.source === 'courtlistener' ? 'Court Listener' : 'Harvard CAP'}

---

Can you provide a detailed explanation of this case, including:
1. The key facts and background
2. The legal issues and questions presented
3. The court's holding and reasoning
4. The significance and implications of this decision
5. How this case might be applied in legal analysis`;

    // Encode the prompt and navigate to chat
    const encodedPrompt = encodeURIComponent(prompt);
    router.push(`/chat?message=${encodedPrompt}`);
  };

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col p-4 sm:p-6">
      <div className="flex h-full min-h-0 flex-col">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Case Library</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Browse and study legal cases from Court Listener's comprehensive database.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search cases by title, citation, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Select value={selectedCourtLevel} onValueChange={setSelectedCourtLevel}>
              <SelectTrigger className="w-[140px] sm:w-[160px]">
                <SelectValue placeholder="Court Level" />
              </SelectTrigger>
              <SelectContent>
                {courtLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger className="w-[120px] sm:w-[140px]">
                <SelectValue placeholder="Topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                <SelectItem value="civil rights">Civil Rights</SelectItem>
                <SelectItem value="criminal law">Criminal Law</SelectItem>
                <SelectItem value="constitutional law">Constitutional Law</SelectItem>
                <SelectItem value="contract law">Contract Law</SelectItem>
                <SelectItem value="tort law">Tort Law</SelectItem>
                <SelectItem value="administrative law">Administrative Law</SelectItem>
                <SelectItem value="employment law">Employment Law</SelectItem>
                <SelectItem value="intellectual property">Intellectual Property</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
              <SelectTrigger className="w-[120px] sm:w-[140px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                {dateRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Advanced Filters Sheet */}
            <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <SlidersHorizontal className="size-4" />
                  <span className="hidden sm:inline">Advanced Filters</span>
                  <span className="sm:hidden">Filters</span>
                  {activeFilters.length > 0 && (
                    <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                      {activeFilters.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:w-[500px] lg:w-[580px] flex flex-col">
                <SheetHeader className="px-6 py-6 border-b">
                  <SheetTitle className="text-xl font-semibold">Advanced Filters</SheetTitle>
                  <SheetDescription className="text-sm text-muted-foreground leading-relaxed">
                    Refine your search with detailed filters and legal categories to find exactly what you need.
                  </SheetDescription>
                </SheetHeader>
                
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  <div className="space-y-8">
                    {/* Legal Areas */}
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-foreground">Legal Practice Areas</label>
                        <p className="text-xs text-muted-foreground">Choose from specialized legal categories</p>
                      </div>
                      <Select value={selectedLegalArea} onValueChange={setSelectedLegalArea}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select legal area" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[320px]">
                          <SelectItem value="all" className="py-2 font-medium">
                            All Legal Areas
                          </SelectItem>
                          {legalAreas.slice(1).map((area) => (
                            <div key={area.category}>
                              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-t mt-1 first:border-t-0 first:mt-0">
                                {area.category}
                              </div>
                              {'options' in area && area.options?.map((option) => (
                                <SelectItem 
                                  key={option.value} 
                                  value={option.value} 
                                  className="pl-8 py-2 text-sm"
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Publication Status */}
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-foreground">Publication Status</label>
                        <p className="text-xs text-muted-foreground">Filter by publication type</p>
                      </div>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select publication status" />
                        </SelectTrigger>
                        <SelectContent>
                          {publicationStatus.map((status) => (
                            <SelectItem key={status.value} value={status.value} className="py-2">
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Fixed at bottom */}
                <div className="border-t px-6 py-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      variant="outline" 
                      onClick={clearAllFilters}
                      className="flex-1 h-10"
                    >
                      Clear All Filters
                    </Button>
                    <Button 
                      onClick={() => setIsFiltersOpen(false)}
                      className="flex-1 h-10"
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Active Filters Display */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {activeFilters.map((filter, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {filter}
                  <X 
                    className="size-3 cursor-pointer hover:text-destructive" 
                    onClick={() => {
                      // Handle individual filter removal
                      if (filter.startsWith('Topic:')) setSelectedTopic('all');
                      else if (filter.startsWith('Court:')) setSelectedCourtLevel('all');
                      else if (filter.startsWith('Status:')) setSelectedStatus('all');
                      else if (filter.startsWith('Date:')) setSelectedDateRange('all');
                      else if (filter.startsWith('Legal Area:')) setSelectedLegalArea('all');
                    }}
                  />
                </Badge>
              ))}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAllFilters}
                className="h-6 px-2 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 space-y-4 overflow-auto">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto mb-4 size-12 animate-spin text-muted-foreground" />
                <h3 className="text-lg font-semibold">Searching cases...</h3>
                <p className="text-muted-foreground">Please wait while we search Court Listener</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <BookOpen className="mx-auto mb-4 size-12 text-red-500" />
                <h3 className="text-lg font-semibold text-red-600">Search Error</h3>
                <p className="text-muted-foreground">{error}</p>
                <Button onClick={handleSearch} className="mt-4">
                  Try Again
                </Button>
              </div>
            </div>
          ) : !hasSearched ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <BookOpen className="mx-auto mb-4 size-12 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Search Legal Cases</h3>
                <p className="text-muted-foreground">Enter a search term above to find cases from Court Listener</p>
              </div>
            </div>
          ) : cases.length === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <BookOpen className="mx-auto mb-4 size-12 text-muted-foreground" />
                <h3 className="text-lg font-semibold">No cases found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  Showing {cases.length} of {totalCount} cases
                </p>
              </div>
              
              {cases.map((caseItem) => (
                <Card key={caseItem.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="space-y-1 flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg leading-tight">{caseItem.title}</CardTitle>
                        <CardDescription className="font-mono text-xs sm:text-sm break-all">
                          {caseItem.citation}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleExplainInChat(caseItem)}
                          className="text-xs sm:text-sm gap-1.5"
                        >
                          <MessageSquare className="size-3.5" />
                          Explain in Chat
                        </Button>
                        {caseItem.url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(caseItem.url, '_blank')}
                            className="text-xs sm:text-sm"
                          >
                            View Full Case
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="rounded-md bg-blue-50 p-3 border-l-4 border-blue-200">
                        <p className="text-xs sm:text-sm text-blue-800">
                          <strong>Case Summary:</strong> {caseItem.summary}
                        </p>
                        <p className="text-xs text-blue-600 mt-2">
                          This is a brief summary. Click "View Full Case" above to read the complete legal decision on Court Listener.
                        </p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Scale className="size-3 shrink-0" />
                          <span className="truncate">{caseItem.court}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="size-3 shrink-0" />
                          <span>{new Date(caseItem.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="size-3 shrink-0" />
                          <span>{caseItem.jurisdiction}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {caseItem.topics.map((topic) => (
                          <Badge key={topic} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-6 rounded-lg bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            Case data provided by{' '}
            <a href="https://www.courtlistener.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Court Listener
            </a>
            , a free legal research tool with millions of legal opinions, PACER data, and more.
          </p>
        </div>
      </div>
    </div>
  );
}
