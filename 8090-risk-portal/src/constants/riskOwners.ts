// Standardized list of risk owners
export const RISK_OWNERS = [
  'AI Leader',
  'Compliance',
  'Ethics Board',
  'Finance',
  'HR',
  'IP',
  'IT',
  'IT Leader',
  'IT Security',
  'LOB',
  'LOBs',
  'Legal',
  'Privacy',
  'Process Owner',
  'Quality'
] as const;

// TypeScript type for risk owners
export type RiskOwner = typeof RISK_OWNERS[number];

// Display configuration for risk owners
export const RISK_OWNER_CONFIG: Record<RiskOwner, {
  label: string;
  description?: string;
  color?: string;
}> = {
  'AI Leader': {
    label: 'AI Leader',
    description: 'AI/ML governance and strategy leadership',
    color: 'blue'
  },
  'Compliance': {
    label: 'Compliance',
    description: 'Regulatory compliance and standards',
    color: 'purple'
  },
  'Ethics Board': {
    label: 'Ethics Board',
    description: 'AI ethics and responsible AI oversight',
    color: 'indigo'
  },
  'Finance': {
    label: 'Finance',
    description: 'Financial oversight and budget management',
    color: 'green'
  },
  'HR': {
    label: 'HR',
    description: 'Human resources and workforce impact',
    color: 'pink'
  },
  'IP': {
    label: 'IP',
    description: 'Intellectual property management',
    color: 'orange'
  },
  'IT': {
    label: 'IT',
    description: 'Information technology operations',
    color: 'cyan'
  },
  'IT Leader': {
    label: 'IT Leader',
    description: 'IT leadership and strategy',
    color: 'teal'
  },
  'IT Security': {
    label: 'IT Security',
    description: 'Cybersecurity and data protection',
    color: 'red'
  },
  'LOB': {
    label: 'LOB',
    description: 'Line of Business',
    color: 'yellow'
  },
  'LOBs': {
    label: 'LOBs',
    description: 'Multiple Lines of Business',
    color: 'yellow'
  },
  'Legal': {
    label: 'Legal',
    description: 'Legal affairs and contract management',
    color: 'gray'
  },
  'Privacy': {
    label: 'Privacy',
    description: 'Data privacy and protection',
    color: 'violet'
  },
  'Process Owner': {
    label: 'Process Owner',
    description: 'Business process ownership',
    color: 'amber'
  },
  'Quality': {
    label: 'Quality',
    description: 'Quality assurance and control',
    color: 'emerald'
  }
};

// Helper to normalize owner strings to standardized values
export const normalizeOwner = (owner: string): RiskOwner | null => {
  const normalized = owner.trim();
  
  // Direct match
  if (RISK_OWNERS.includes(normalized as RiskOwner)) {
    return normalized as RiskOwner;
  }
  
  // Case-insensitive match
  const lowerCase = normalized.toLowerCase();
  const match = RISK_OWNERS.find(o => o.toLowerCase() === lowerCase);
  if (match) return match;
  
  // Special mappings
  const mappings: Record<string, RiskOwner> = {
    'lob': 'LOB',
    'lobs': 'LOBs',
    'it security': 'IT Security',
    'it leader': 'IT Leader',
    'ai leader': 'AI Leader',
    'ethics board': 'Ethics Board',
    'process owner': 'Process Owner'
  };
  
  if (mappings[lowerCase]) {
    return mappings[lowerCase];
  }
  
  return null;
};

// Parse comma-separated owner string into array
export const parseOwners = (ownerString: string): RiskOwner[] => {
  if (!ownerString || !ownerString.trim()) return [];
  
  const owners = ownerString
    .split(',')
    .map(o => o.trim())
    .map(o => normalizeOwner(o))
    .filter((o): o is RiskOwner => o !== null);
  
  // Remove duplicates
  return [...new Set(owners)];
};