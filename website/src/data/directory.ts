/**
 * The painters directory: one public page per painting business on Paint Trade HQ, plus an index by
 * state. Until real subscribers opt in, the entries below are SAMPLES: they carry a visible "Sample
 * listing" badge, get no search-engine structured data, and disappear when PUBLIC_SHOW_SAMPLES=0.
 * Real listings will come from the app (an opt-in and a public profile in Settings) and replace them.
 */
export type Listing = {
  slug: string;
  name: string;
  suburb: string;
  state: 'VIC' | 'NSW' | 'QLD' | 'WA' | 'SA' | 'TAS' | 'ACT' | 'NT';
  areas: string[];
  services: string[];
  blurb: string;
  since: string;
  phone?: string;
  website?: string;
  sample?: boolean;
};

export const STATES: Record<Listing['state'], string> = {
  VIC: 'Victoria',
  NSW: 'New South Wales',
  QLD: 'Queensland',
  WA: 'Western Australia',
  SA: 'South Australia',
  TAS: 'Tasmania',
  ACT: 'Australian Capital Territory',
  NT: 'Northern Territory',
};

export const listings: Listing[] = [
  {
    slug: 'harbourline-painting',
    name: 'Harbourline Painting',
    suburb: 'Mosman',
    state: 'NSW',
    areas: ['Lower North Shore', 'Northern Beaches', 'Inner West'],
    services: ['Interior repaints', 'Exterior repaints', 'Heritage timber', 'Strata and body corporate'],
    blurb: 'Sample listing. Harbourline is the demo business you see in the app screenshots: a four-person crew doing residential interiors and exteriors across the Lower North Shore. A real listing reads like this: who they are, where they work, what they do best.',
    since: '2026',
    sample: true,
  },
  {
    slug: 'northgate-painting-co',
    name: 'Northgate Painting Co.',
    suburb: 'Preston',
    state: 'VIC',
    areas: ['Northern suburbs', 'Inner north', 'Whittlesea'],
    services: ['Interior repaints', 'Exterior repaints', 'Roof and gutter painting', 'Commercial fit-outs'],
    blurb: 'Sample listing. A family crew of six working the northern suburbs, with a second van for commercial work.',
    since: '2026',
    sample: true,
  },
  {
    slug: 'two-coats-brothers',
    name: 'Two Coats Brothers',
    suburb: 'Bayswater',
    state: 'WA',
    areas: ['Perth east', 'Hills', 'Midland'],
    services: ['Interior repaints', 'Feature walls', 'Timber decks and fences'],
    blurb: 'Sample listing. Two brothers, one ute, a loyal run of repeat clients in the eastern suburbs.',
    since: '2026',
    sample: true,
  },
  {
    slug: 'rivergum-decorators',
    name: 'Rivergum Decorators',
    suburb: 'Toowong',
    state: 'QLD',
    areas: ['Brisbane west', 'Indooroopilly', 'Kenmore'],
    services: ['Queenslander exteriors', 'Interior repaints', 'Wallpaper', 'Lead-safe preparation'],
    blurb: 'Sample listing. Queenslander specialists: full exterior preparation, lead-safe, with the before-and-after photos to prove it.',
    since: '2026',
    sample: true,
  },
  {
    slug: 'coastline-finish',
    name: 'Coastline Finish',
    suburb: 'Glenelg',
    state: 'SA',
    areas: ['Adelaide coast', 'Brighton', 'Marion'],
    services: ['Exterior repaints', 'Render and masonry', 'Interior repaints'],
    blurb: 'Sample listing. Coastal exteriors that cop the salt: render, masonry and timber, with the right primers for the job.',
    since: '2026',
    sample: true,
  },
  {
    slug: 'highside-painters',
    name: 'Highside Painters',
    suburb: 'Hobart',
    state: 'TAS',
    areas: ['Greater Hobart', 'Kingston', 'Huon Valley'],
    services: ['Interior repaints', 'Heritage weatherboard', 'Colour consulting'],
    blurb: 'Sample listing. Weatherboard and heritage work around Hobart, with colour advice included in the quote.',
    since: '2026',
    sample: true,
  },
];

export const showSamples = import.meta.env.PUBLIC_SHOW_SAMPLES !== '0';
export const visibleListings = listings.filter((l) => showSamples || !l.sample);
