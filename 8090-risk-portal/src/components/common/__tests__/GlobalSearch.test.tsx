import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { GlobalSearch } from '../GlobalSearch';
import { useRiskStore, useControlStore } from '../../../store';

// Mock the stores
vi.mock('../../../store', () => ({
  useRiskStore: vi.fn(),
  useControlStore: vi.fn()
}));

// Mock router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

const mockRisks = [
  {
    id: 'AIR-01',
    risk: 'Model Bias Risk',
    riskDescription: 'AI model exhibits discriminatory behavior',
    riskCategory: 'AI Human Impact Risks' as const,
    residualScoring: { 
      riskLevelCategory: 'High',
      likelihood: 3,
      impact: 4,
      riskLevel: 12
    },
    initialScoring: {
      likelihood: 4,
      impact: 5,
      riskLevel: 20,
      riskLevelCategory: 'Critical'
    },
    agreedMitigation: 'Implement bias detection and monitoring',
    proposedOversightOwnership: ['AI Ethics Team'],
    proposedSupport: ['Data Science Team'],
    notes: 'Regular audits required',
    exampleMitigations: '',
    relatedControlIds: ['CTRL-01'],
    riskReduction: 8,
    riskReductionPercentage: 40,
    mitigationEffectiveness: 'Medium'
  },
  {
    id: 'AIR-02',
    risk: 'Data Privacy Risk',
    riskDescription: 'Unauthorized access to sensitive data',
    riskCategory: 'Security and Data Risks' as const,
    residualScoring: { 
      riskLevelCategory: 'Critical',
      likelihood: 4,
      impact: 5,
      riskLevel: 20
    },
    initialScoring: {
      likelihood: 5,
      impact: 5,
      riskLevel: 25,
      riskLevelCategory: 'Critical'
    },
    agreedMitigation: 'Encrypt all sensitive data',
    proposedOversightOwnership: ['Security Team'],
    proposedSupport: ['IT Department'],
    notes: 'GDPR compliance required',
    exampleMitigations: '',
    relatedControlIds: ['CTRL-02'],
    riskReduction: 5,
    riskReductionPercentage: 20,
    mitigationEffectiveness: 'Low'
  }
];

const mockControls = [
  {
    mitigationID: 'CTRL-01',
    mitigationDescription: 'Implement bias detection framework',
    category: 'Security & Data Privacy' as const,
    implementationStatus: 'Implemented',
    effectiveness: 'High',
    relatedRiskIds: ['AIR-01'],
    compliance: {
      cfrPart11Annex11: '',
      hipaaSafeguard: '',
      gdprArticle: 'Article 22',
      euAiActArticle: 'Article 10',
      nist80053: 'SI-4',
      soc2TSC: ''
    },
    complianceScore: 0.8,
    createdAt: new Date(),
    lastUpdated: new Date()
  },
  {
    mitigationID: 'CTRL-02',
    mitigationDescription: 'Data encryption at rest',
    category: 'Security & Data Privacy' as const,
    implementationStatus: 'In Progress',
    effectiveness: 'Medium',
    relatedRiskIds: ['AIR-02'],
    compliance: {
      cfrPart11Annex11: '11.10',
      hipaaSafeguard: 'Technical',
      gdprArticle: 'Article 32',
      euAiActArticle: '',
      nist80053: 'SC-28',
      soc2TSC: 'CC6.1'
    },
    complianceScore: 0.6,
    createdAt: new Date(),
    lastUpdated: new Date()
  }
];

describe('GlobalSearch Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    (useRiskStore as jest.MockedFunction<typeof useRiskStore>).mockReturnValue({
      risks: mockRisks
    });
    
    (useControlStore as jest.MockedFunction<typeof useControlStore>).mockReturnValue({
      controls: mockControls
    });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <GlobalSearch />
      </BrowserRouter>
    );
  };

  it('renders search input', () => {
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText(/search risks and controls/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('shows search icon', () => {
    renderComponent();
    
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  it('shows results when typing', async () => {
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText(/search risks and controls/i);
    fireEvent.change(searchInput, { target: { value: 'bias' } });
    
    await waitFor(() => {
      // Use custom text matchers since the text might be broken up by highlight elements
      const riskElements = screen.getAllByText((_content, element) => {
        return element?.textContent === 'Model Bias Risk';
      });
      expect(riskElements.length).toBeGreaterThan(0);
      
      const controlElements = screen.getAllByText((_content, element) => {
        return element?.textContent === 'Implement bias detection framework';
      });
      expect(controlElements.length).toBeGreaterThan(0);
    });
  });

  it('highlights matching text', async () => {
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText(/search risks and controls/i);
    fireEvent.change(searchInput, { target: { value: 'data' } });
    
    await waitFor(() => {
      const riskElements = screen.getAllByText((_content, element) => {
        return element?.textContent === 'Data Privacy Risk';
      });
      expect(riskElements.length).toBeGreaterThan(0);
      
      const controlElements = screen.getAllByText((_content, element) => {
        return element?.textContent === 'Data encryption at rest';
      });
      expect(controlElements.length).toBeGreaterThan(0);
    });
  });

  it('navigates to risk detail when risk is clicked', async () => {
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText(/search risks and controls/i);
    fireEvent.change(searchInput, { target: { value: 'model' } });
    
    await waitFor(() => {
      const riskResults = screen.getAllByText((_content, element) => {
        return element?.textContent === 'Model Bias Risk';
      });
      // Click the first matching element's button
      fireEvent.click(riskResults[0].closest('button')!);
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('/risks/AIR-01');
  });

  it('navigates to control detail when control is clicked', async () => {
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText(/search risks and controls/i);
    fireEvent.change(searchInput, { target: { value: 'encryption' } });
    
    await waitFor(() => {
      const controlResults = screen.getAllByText((_content, element) => {
        return element?.textContent === 'Data encryption at rest';
      });
      // Click the first matching element's button
      fireEvent.click(controlResults[0].closest('button')!);
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('/controls/CTRL-02');
  });

  it('shows no results message when no matches found', async () => {
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText(/search risks and controls/i);
    fireEvent.change(searchInput, { target: { value: 'xyz123' } });
    
    await waitFor(() => {
      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
    });
  });

  it('requires minimum 2 characters to search', async () => {
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText(/search risks and controls/i);
    fireEvent.change(searchInput, { target: { value: 'a' } });
    
    // Should not show results for single character
    expect(screen.queryByText((_content, element) => {
      return element?.textContent === 'Model Bias Risk';
    })).not.toBeInTheDocument();
  });

  it('closes results when clicking outside', async () => {
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText(/search risks and controls/i);
    fireEvent.change(searchInput, { target: { value: 'risk' } });
    
    await waitFor(() => {
      const elements = screen.getAllByText((_content, element) => {
        return element?.textContent === 'Model Bias Risk';
      });
      expect(elements.length).toBeGreaterThan(0);
    });
    
    // Click outside
    fireEvent.mouseDown(document.body);
    
    await waitFor(() => {
      const elements = screen.queryAllByText((_content, element) => {
        return element?.textContent === 'Model Bias Risk';
      });
      expect(elements.length).toBe(0);
    });
  });

  it('closes dropdown when escape is pressed', async () => {
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText(/search risks and controls/i) as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Wait for dropdown to open
    await waitFor(() => {
      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
    });
    
    // Press escape
    fireEvent.keyDown(window, { key: 'Escape' });
    
    // Dropdown should be closed but search term remains
    await waitFor(() => {
      expect(screen.queryByText(/no results found/i)).not.toBeInTheDocument();
    });
    expect(searchInput.value).toBe('test');
  });

});