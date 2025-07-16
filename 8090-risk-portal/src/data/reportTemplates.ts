export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
}

export const reportTemplates: Record<string, ReportTemplate> = {
  executive: {
    id: 'executive',
    name: 'Executive Summary',
    description: 'High-level overview for leadership',
    template: `Generate a concise executive summary for the AI Risk Assessment project at {{companyName}}.

Total Risks Identified: {{totalRisks}}
Risk Distribution: {{riskDistribution}}
Assessment Date: {{currentDate}}

Please provide:
1. A 2-3 paragraph overview of the AI risk landscape, highlighting the most critical concerns
2. Top 5 critical risks requiring immediate executive attention
3. Overall risk posture and organizational readiness assessment
4. Strategic recommendations for risk mitigation at the enterprise level
5. Clear next steps with suggested timeline and resource requirements

Keep the summary under 500 words, using business-friendly language focused on strategic impact and decision-making. Avoid technical jargon.`
  },
  
  assessment: {
    id: 'assessment',
    name: 'AI Project Risk Assessment Summary',
    description: 'Comprehensive risk assessment following pharmaceutical compliance standards',
    template: `Generate a comprehensive AI Project Risk Assessment Summary for {{companyName}} following pharmaceutical industry standards and regulatory requirements.

PROJECT INFORMATION:
- Company: {{companyName}}
- Assessment Date: {{currentDate}}
- Total Risks Analyzed: {{totalRisks}}
- Risk Categories: {{categories}}
- Risk Distribution: {{riskDistribution}}

DETAILED RISK DATA:
Critical Risks ({{criticalCount}}): {{criticalRisks}}
High Risks ({{highCount}}): {{highRisks}}

Please create a detailed report following this exact structure:

1. PROJECT INFORMATION
   - Project Title: AI Risk Management Portal Implementation
   - Project Sponsor: [To be determined]
   - Project Manager: [To be determined]
   - Date of Assessment: {{currentDate}}
   - Departments Involved: IT Security, Compliance, Medical Affairs, Quality Assurance, Regulatory Affairs, Legal
   - Assessment Prepared By: AI Risk Assessment Team

2. EXECUTIVE SUMMARY
   Provide a comprehensive overview of the AI risk assessment project, its objectives, findings, and the critical importance of risk management in pharmaceutical AI implementations. Include regulatory context (GDPR, EU AI Act, FDA guidance).

3. RISK ASSESSMENT METHODOLOGY
   Describe the systematic approach used:
   - Qualitative and quantitative analysis of {{totalRisks}} identified risks
   - Risk categorization across {{categoryCount}} key areas
   - Likelihood and impact scoring methodology (1-5 scale)
   - Residual risk calculation post-mitigation

4. KEY RISK AREAS ANALYZED
   For each area below, provide specific findings from the assessment:
   
   • Data Privacy & Protection (GDPR compliance)
     - Key risks identified
     - Compliance gaps
     - Required controls
   
   • Data Integrity & Quality
     - Data governance risks
     - Quality assurance measures
     
   • Model Transparency & Explainability
     - Black box AI concerns
     - Regulatory requirements
     
   • Model Bias & Fairness
     - Bias detection findings
     - Fairness metrics
     
   • Cybersecurity
     - Security vulnerabilities
     - Protection measures
     
   • Regulatory Compliance
     - Applicable regulations
     - Compliance status
     
   • Operational Impact
     - Business process risks
     - Continuity planning
     
   • Ethical Considerations
     - Ethical AI principles
     - Governance framework
     
   • Business Continuity & Resilience
     - Availability risks
     - Recovery procedures

5. IMPACT ASSESSMENT
   Provide detailed impact analysis:
   {{impactByCategory}}

6. MITIGATION MEASURES ADOPTED
   Detail the comprehensive mitigation strategies:
   {{mitigationSummary}}
   
   Include responsible parties and implementation timelines.

7. RESIDUAL RISK PROFILE
   Analyze the risk landscape after mitigation:
   - Comparison of initial vs residual risk levels
   - Risks remaining above acceptable thresholds
   - Risk acceptance rationale and sign-offs required

8. ROLES AND CONTRIBUTIONS OF RESPONSIBLE FUNCTIONS
   Define specific responsibilities:
   
   • Data Protection Officer (DPO): 
     - GDPR compliance oversight
     - Privacy impact assessments
     - Data subject rights management
   
   • IT Security Lead:
     - Technical security controls
     - Vulnerability management
     - Incident response
   
   • Quality Assurance:
     - GxP compliance validation
     - Data integrity verification
     - Change control procedures
   
   • Regulatory Affairs:
     - Regulatory intelligence
     - Submission support
     - Compliance monitoring
   
   • AI/Data Science Lead:
     - Model governance
     - Bias monitoring
     - Performance validation
   
   • Ethics Committee:
     - Ethical review process
     - Policy development
     - Stakeholder engagement

9. RECOMMENDATIONS AND NEXT STEPS
   Provide actionable recommendations with:
   - Priority ranking
   - Resource requirements
   - Implementation timeline
   - Success metrics

10. APPROVAL AND SIGN-OFF
    List required approvals from:
    - Project Sponsor
    - Risk Committee
    - Compliance Officer
    - IT Security Lead
    - Quality Assurance Head

Format the report professionally with clear sections, bullet points, and emphasis on pharmaceutical regulatory compliance throughout.`
  }
};