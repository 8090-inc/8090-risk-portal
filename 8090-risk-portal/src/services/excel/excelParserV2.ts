import XLSX from 'xlsx';

export interface RiskMapRow {
  riskCategory: string;
  risk: string;
  riskDescription: string;
  initialLikelihood: number;
  initialImpact: number;
  initialRiskLevel: number;
  riskLevelCategory: string;
  exampleMitigations: string;
  agreedMitigation: string;
  proposedOversightOwnership: string;
  proposedSupport: string;
  notes: string;
  residualLikelihood: number;
  residualImpact: number;
  residualRiskLevel: number;
}

export interface ControlsMappingRow {
  mitigationID: string;
  mitigationDescription: string;
  cfrPart11Annex11: string;
  hipaaSafeguard: string;
  gdprArticle: string;
  euAiActArticle: string;
  nist80053: string;
  soc2TSC: string;
  category?: string; // For category rows like "Accuracy & Judgment"
}

export interface ExcelDataV2 {
  riskMap: RiskMapRow[];
  controlsMapping: ControlsMappingRow[];
  riskCategories: string[];
  scoringMethodology: string;
}

export class ExcelParserV2 {
  private workbook: XLSX.WorkBook | null = null;
  
  async loadFile(file: File | ArrayBuffer): Promise<void> {
    try {
      if (file instanceof File) {
        const arrayBuffer = await file.arrayBuffer();
        this.workbook = XLSX.read(arrayBuffer, { type: 'array' });
      } else {
        this.workbook = XLSX.read(file, { type: 'array' });
      }
    } catch (error) {
      throw new Error(`Failed to load Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private parseRiskMap(): { risks: RiskMapRow[], categories: string[] } {
    if (!this.workbook) throw new Error('No workbook loaded');
    
    const sheet = this.workbook.Sheets['Risk Map'];
    if (!sheet) throw new Error('Risk Map sheet not found');
    
    const data = XLSX.utils.sheet_to_json<any>(sheet, { header: 1 });
    const risks: RiskMapRow[] = [];
    const categories = new Set<string>();
    
    // Headers are in row 2 (index 2)
    const dataStartRow = 4; // Data starts from row 4
    
    let currentCategory = '';
    
    for (let i = dataStartRow; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      
      // Check if this row has a category in the first column and a risk in the second column
      // This is the pattern for the first risk in each category
      if (row[0] && row[1]) {
        currentCategory = row[0].trim();
        categories.add(currentCategory);
      }
      
      // Check if this is a data row (has risk name in column 1)
      if (row[1]) {
        const risk: RiskMapRow = {
          riskCategory: currentCategory,
          risk: row[1] || '',
          riskDescription: row[2] || '',
          initialLikelihood: parseFloat(row[3]) || 0,
          initialImpact: parseFloat(row[4]) || 0,
          initialRiskLevel: parseFloat(row[5]) || 0,
          riskLevelCategory: row[6] || '',
          exampleMitigations: this.concatenateMitigations(data, i, 7),
          agreedMitigation: row[8] || '',
          proposedOversightOwnership: row[9] || '',
          proposedSupport: row[10] || '',
          notes: row[11] || '',
          residualLikelihood: parseFloat(row[12]) || 0,
          residualImpact: parseFloat(row[13]) || 0,
          residualRiskLevel: parseFloat(row[14]) || 0
        };
        
        risks.push(risk);
      }
    }
    
    return { risks, categories: Array.from(categories) };
  }
  
  private concatenateMitigations(data: any[][], startRow: number, column: number): string {
    const mitigations: string[] = [];
    
    // Add the mitigation from the current row
    if (data[startRow][column]) {
      mitigations.push(data[startRow][column]);
    }
    
    // Look at subsequent rows to see if they contain additional mitigations
    for (let i = startRow + 1; i < data.length; i++) {
      const row = data[i];
      
      // Stop if we hit a new risk (has value in column 1) or category
      if (row[0] || row[1]) break;
      
      // If there's a mitigation in the same column, add it
      if (row[column]) {
        mitigations.push(row[column]);
      }
    }
    
    return mitigations.join('\n\n');
  }
  
  private parseControlsMapping(): ControlsMappingRow[] {
    if (!this.workbook) throw new Error('No workbook loaded');
    
    const sheet = this.workbook.Sheets['Controls Mapping'];
    if (!sheet) throw new Error('Controls Mapping sheet not found');
    
    const data = XLSX.utils.sheet_to_json<any>(sheet, { header: 1 });
    const controls: ControlsMappingRow[] = [];
    
    // Headers are in row 0
    let currentCategory = '';
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      
      // Check if this is a category row (only first column has value)
      if (row[0] && !row[1]) {
        currentCategory = row[0].trim();
        continue;
      }
      
      // This is a control row
      if (row[0]) {
        const control: ControlsMappingRow = {
          mitigationID: row[0] || '',
          mitigationDescription: row[1] || '',
          cfrPart11Annex11: row[2] || '',
          hipaaSafeguard: row[3] || '',
          gdprArticle: row[4] || '',
          euAiActArticle: row[5] || '',
          nist80053: row[6] || '',
          soc2TSC: row[7] || '',
          category: currentCategory
        };
        
        controls.push(control);
      }
    }
    
    return controls;
  }
  
  private parseScoringMethodology(): string {
    if (!this.workbook) throw new Error('No workbook loaded');
    
    const sheet = this.workbook.Sheets['Scoring Result Index'];
    if (!sheet) return '';
    
    const data = XLSX.utils.sheet_to_json<any>(sheet, { header: 1 });
    
    // The methodology is in the first cell
    if (data.length > 0 && data[0][0]) {
      return data[0][0];
    }
    
    return '';
  }
  
  parseExcel(): ExcelDataV2 {
    if (!this.workbook) throw new Error('No workbook loaded');
    
    const { risks, categories } = this.parseRiskMap();
    const controlsMapping = this.parseControlsMapping();
    const scoringMethodology = this.parseScoringMethodology();
    
    return {
      riskMap: risks,
      controlsMapping,
      riskCategories: categories,
      scoringMethodology
    };
  }
  
  // Helper method to create risk-control relationships
  createRelationshipMap(data: ExcelDataV2): {
    riskToControls: Map<string, string[]>;
    controlCategories: Map<string, string>;
  } {
    const riskToControls = new Map<string, string[]>();
    const controlCategories = new Map<string, string>();
    
    // Map control categories
    data.controlsMapping.forEach(control => {
      if (control.category) {
        controlCategories.set(control.mitigationID, control.category);
      }
    });
    
    // Create risk to controls mapping based on risk names and mitigation descriptions
    data.riskMap.forEach(risk => {
      const relatedControls: string[] = [];
      
      // Search for controls that might be related to this risk
      data.controlsMapping.forEach(control => {
        // Simple matching based on keywords - this can be improved
        const riskKeywords = risk.risk.toLowerCase().split(' ');
        const controlDesc = control.mitigationDescription.toLowerCase();
        
        if (riskKeywords.some(keyword => 
          keyword.length > 3 && controlDesc.includes(keyword)
        )) {
          relatedControls.push(control.mitigationID);
        }
      });
      
      if (relatedControls.length > 0) {
        riskToControls.set(risk.risk, relatedControls);
      }
    });
    
    return { riskToControls, controlCategories };
  }
}