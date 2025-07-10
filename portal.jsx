import React, { useState, useMemo } from 'react';

// --- Data from "General AI Risk Map (Risk Map) (2).csv" ---
// This data is now a 1:1 mapping of the provided spreadsheet, ensuring 100% data fidelity for all fields.

const riskMapData = [
  { id: 'AIR-01', risk: 'Risk Accuracy', category: 'Other Risks', description: 'The AI model provides results that are not consistently accurate or reliable, leading to flawed business decisions.', domain: 'Model Lifecycle', likelihood: 4, impact: 4, velocity: 3, owner: 'R&D Team', mitigation: 'Implement rigorous model validation and require human verification of GenAI outputs to ensure accuracy meets regulatory standards. 8090 and Dompe have aligned on pre-agreed upon metrics for success and accuracy for each AI project. See https://dompe.sharepoint.com/:w:/s/MedicalAffairsSharedDrive/EeIHdfhOFNLvHlW1PSfqqwAMBy2Vk8hydro2110aCNTNTg?e=sv32bp', support: 'IT Operations', notes: `**8090's Responsibilities:**
1. **System Design & Validation (RAG):** 8090 will implement and validate a Retrieval-Augmented Generation (RAG) architecture. This system will use a validated, version-controlled corpus of Dompe's GxP documents as the single source of truth. GxP refers to regulations for life sciences organizations). The system will be designed to prevent access to unapproved external sources for GxP-related queries, aligning with 21 CFR 11.10(a) and EU Annex 11.3.
2. **Prompt Engineering & Guardrails:** 8090 will develop and validate standardized prompt templates that instruct the model to use only the provided context and to state “information not found in provided context” when an answer is not present.

**Dompe's Responsibilities:**
3. **Human-in-the-Loop (HITL) Verification:** Dompe will ensure that all AI-generated outputs for GxP-regulated decisions are verified and approved by a qualified expert. This process, including electronic signatures, must comply with 21 CFR Part 11 and EU Annex 11.13.
4. **Continuous Monitoring & CAPA:** Dompe will implement a user feedback mechanism for reporting inaccuracies. These reports will trigger Dompe's formal CAPA process.` },
  { id: 'AIR-02', risk: 'Biased Outputs', category: 'AI Human Impact Risks', description: 'Generative AI models, particularly Large Language Models (LLMs), are susceptible to producing biased outputs. This is primarily because these models are trained on vast datasets compiled from the internet and many other sources, which often contain biased, inaccurate, or otherwise problematic information. The inherent bias in these datasets reflects the biases present in the broader world, leading to AI systems that can inadvertently perpetuate or even amplify these biases in their outputs.', domain: 'Ethics & Fairness', likelihood: 5, impact: 5, velocity: 4, owner: 'Legal & Compliance', mitigation: `8090 will assist Dompe in identifying potential sources of statistical bias in the document set. Perform bias audits on AI outputs and use diverse, representative data sets; enable human review to correct any biased content before use. Use bias detection tools and grounding mechanisms to check and correct AI model outputs from known biases. The system will allow Dompe to add a disclaimer to AI-generated content, noting the potential for bias and the need for critical review.`, notes: `Procedural Controls (Owned by Dompe):
1. **Prohibited Use Policy:** Dompe will define and enforce a policy prohibiting the AI's use for high-risk HR decisions (e.g., hiring, promotion) as defined by the EU AI Act.
2. **Diverse Human Review:** Dompe will establish a process for reviewers to audit AI outputs for subtle or contextual bias before use in sensitive applications.

Bias Mitigation and Fairness Framework:
1. Support for Prohibited Use Case Policy: 8090 will provide controls to help Dompe enforce its policy prohibiting the use of the GenAI system for automated decision-making in high-risk HR activities (as defined by EU AI Act Annex III.21).
2. Data Governance for RAG: If a RAG architecture is used, the system will support Dompe's data governance procedures for reviewing the internal document corpus for bias.
3. Fairness Testing & Auditing: 8090 will provide tools to enable Dompe to conduct periodic fairness testing and auditing for biased outputs. This aligns with the EU AI Act's requirements for HRAIs.6
4. Transparency and Disclosure: The system will allow Dompe to include a clear disclaimer noting the potential for algorithmic bias. This aligns with EMA guidance on transparency.` },
  { id: 'AIR-03', risk: 'Outdated Information', category: 'Security and Data Risks', description: 'The model relies on old data, providing information or recommendations that are no longer relevant or correct.', domain: 'Data Governance', likelihood: 3, impact: 4, velocity: 2, owner: 'Functional Business Leader', mitigation: 'Use AI models that allow frequent updates or real-time data retrieval. Timestamp AI outputs and require users to verify against current sources. Ground the AI with up-to-date databases or web searches. Train users to double-check AI-provided facts against the latest literature.', support: 'Data Engineering', notes: `**8090's Responsibilities:**
1. **Enforce RAG-Only Responses:** The system will be configured with strict context grounding to rely exclusively on the provided, version-controlled documents for GxP queries, with the base model's knowledge disabled for these use cases.
2. **Document Version Control:** The RAG knowledge base will be integrated with Dompe's document management system to use only the latest, approved document versions.
3. **Source Citation:** All AI-generated responses will include a precise citation (document name, version, and page/section number) for traceability and verification.` },
  { id: 'AIR-04', risk: 'Scope Violations', category: 'Behavioral Risks', description: 'The AI system is used for purposes beyond its intended and validated scope, introducing unforeseen risks.', domain: 'Governance', likelihood: 3, impact: 5, velocity: 3, owner: 'Legal & Compliance', mitigation: 'Define strict use-case boundaries and implement prompt filters; educate users to avoid queries outside the AI\'s domain and to flag any off-topic responses.', support: 'Functional Business Leader', notes: `1. **Technical:** Implement and validate standardized prompt templates that explicitly instruct the model to only use the provided document context and to refuse to answer if the information is not present.
2. **Procedural:** Conduct adversarial testing (“Red Teaming”) to actively find prompts that cause scope violations and use these findings to refine prompt guardrails.
3. **Compliance:** The system’s intended use and scope must be clearly defined in the validation plan and user training materials, as required by GxP.` },
  { id: 'AIR-05', risk: 'Availability', category: 'Business/Cost Related Risks', description: 'The AI service is unavailable when needed, disrupting critical business processes that depend on it.', domain: 'Operations', likelihood: 4, impact: 4, velocity: 5, owner: 'IT Operations', mitigation: '8090 will define and monitor SLAs for uptime; implement redundant systems for critical AI services.', support: 'Vendor Management', notes: 'Dependency is high for real-time decision support tools.' },
  { id: 'AIR-06', risk: 'Limited Vendor Liabilities', category: 'Business/Cost Related Risks', description: 'The vendor contract offers minimal recourse or liability coverage if the AI service fails or causes harm.', domain: 'Vendor Management', likelihood: 4, impact: 5, velocity: 2, owner: 'Legal & Procurement', mitigation: 'Dompe will negotiate stronger liability and indemnity clauses in all AI vendor contracts.', support: 'IT Security', notes: 'Standard vendor paper often favors the vendor heavily.' },
  { id: 'AIR-07', risk: 'Lack of Explainability', category: 'Transparency Risks', description: 'The "black box" nature of models makes it difficult to explain their decisions, hindering trust and accountability.', domain: 'Transparency', likelihood: 4, impact: 4, velocity: 2, owner: 'Functional Business Leader', mitigation: '8090 will prioritize interpretable models; where not possible, use explainability frameworks (e.g., SHAP, LIME).', support: 'R&D Team', notes: '' },
  { id: 'AIR-08', risk: 'Failure to Disclose AI', category: 'Transparency Risks', description: 'The company fails to be transparent with customers or users that they are interacting with an AI system.', domain: 'Transparency', likelihood: 3, impact: 3, velocity: 4, owner: 'Marketing & Communications', mitigation: 'Dompe will create a clear AI disclosure policy and standard language for customer-facing applications.', support: 'Legal & Compliance', notes: '' },
  { id: 'AIR-09', risk: 'Sensitive Information Leakage', category: 'Security and Data Risks', description: 'Proprietary or personal data is inadvertently revealed by the AI model in its outputs.', domain: 'Data Governance', likelihood: 5, impact: 5, velocity: 5, owner: 'IT Security', mitigation: '8090 will implement output filtering and data loss prevention (DLP) tools on model responses.', support: 'Data Governance Team', notes: 'Particularly high risk with generative models.' },
  { id: 'AIR-10', risk: 'Copyright Infringements', category: 'Security and Data Risks', description: 'The AI model generates content that violates existing copyrights, exposing the company to legal action.', domain: 'Legal & Regulatory', likelihood: 4, impact: 4, velocity: 4, owner: 'Legal & Compliance', mitigation: 'Dompe will use models from vendors with strong indemnification policies; train users on responsible use.', support: 'Content Teams', notes: 'The legal landscape is still evolving here.' },
  { id: 'AIR-11', risk: 'Hackers Abuse In-House GenAI Solutions', category: 'Security and Data Risks', description: 'External actors exploit vulnerabilities in internal GenAI tools to access data or disrupt operations.', domain: 'Security', likelihood: 3, impact: 5, velocity: 4, owner: 'IT Security', mitigation: '8090 will conduct regular penetration testing and vulnerability scanning of AI applications.', support: 'R&D Team', notes: '' },
  { id: 'AIR-12', risk: 'Unauthorized Information Access via LLMs', category: 'Security and Data Risks', description: 'Employees use LLMs in a way that provides unauthorized parties access to sensitive company information.', domain: 'Security', likelihood: 4, impact: 5, velocity: 4, owner: 'IT Security', mitigation: '8090 will implement RBAC for internal AI tools; block unauthorized third-party AI services.', support: 'HR Department', notes: '' },
  { id: 'AIR-13', risk: 'Failing to Keep Up With Regulations', category: 'Other Risks', description: 'The company falls out of compliance due to rapidly evolving AI laws and regulations.', domain: 'Legal & Regulatory', likelihood: 4, impact: 5, velocity: 3, owner: 'Legal & Compliance', mitigation: 'Dompe will establish a regulatory watchtower process and subscribe to legislative update services.', support: 'External Counsel', notes: 'EU AI Act is a primary driver.' },
  { id: 'AIR-14', risk: 'Employees Abusing GenAI', category: 'Behavioral Risks', description: 'Employees use GenAI for non-business purposes, plagiarism, or to create inappropriate content.', domain: 'Human-AI Interaction', likelihood: 4, impact: 3, velocity: 3, owner: 'HR Department', mitigation: 'Dompe will develop and enforce a clear Acceptable Use Policy (AUP) for all AI tools.', support: 'Legal & Compliance', notes: '' },
  { id: 'AIR-15', risk: 'Sustainability/Energy Waste', category: 'Business/Cost Related Risks', description: 'Training and running large AI models consume excessive energy, contradicting sustainability goals.', domain: 'Operations', likelihood: 2, impact: 2, velocity: 1, owner: 'Corporate Social Responsibility', mitigation: '8090 will prioritize smaller, more efficient models; track and report on energy consumption of AI workloads.', support: 'IT Operations', notes: '' },
  { id: 'AIR-16', risk: 'Workforce Obsolescence', category: 'AI Human Impact Risks', description: 'AI automates tasks previously done by employees, leading to skill gaps and potential job displacement.', domain: 'Workforce', likelihood: 3, impact: 4, velocity: 2, owner: 'HR Department', mitigation: 'Dompe will develop reskilling and upskilling programs; conduct strategic workforce planning.', support: 'Functional Business Leaders', notes: '' },
  { id: 'AIR-17', risk: 'Workforce Dependency', category: 'Behavioral Risks', description: 'The workforce becomes overly reliant on AI, losing critical skills and the ability to operate without it.', domain: 'Workforce', likelihood: 3, impact: 3, velocity: 2, owner: 'HR Department', mitigation: 'Dompe will incorporate manual/non-AI processes in training; emphasize critical thinking skills.', support: 'Functional Business Leaders', notes: '' },
  { id: 'AIR-18', risk: 'Multiagency Drives Unseen Complexities', category: 'Other Risks', description: 'Interactions between multiple AI agents or systems create emergent, unpredictable, and risky behaviors.', domain: 'Model Lifecycle', likelihood: 3, impact: 5, velocity: 4, owner: 'R&D Team', mitigation: '8090 will implement comprehensive simulation and testing for multi-agent systems before deployment.', support: 'IT Operations', notes: 'This is a forward-looking risk that will grow with AI maturity.' },
  { id: 'AIR-19', risk: 'Reputational Risk', category: 'Business/Cost Related Risks', description: 'An AI-related failure, ethical breach, or controversial use case damages the company’s public image and brand trust.', domain: 'Governance', likelihood: 5, impact: 5, velocity: 5, owner: 'Marketing & Communications', mitigation: 'Dompe will develop a crisis communication plan specific to AI incidents.', support: 'Legal & Compliance, Executive Team', notes: 'Often a secondary risk resulting from other AI failures.' },
  { id: 'AIR-20', risk: 'IP Risk', category: 'Security and Data Risks', description: 'Company intellectual property is leaked when employees input proprietary code or data into public AI models.', domain: 'Legal & Regulatory', likelihood: 5, impact: 5, velocity: 4, owner: 'Legal & IP Department', mitigation: 'Dompe will block access to public AI tools and provide sanctioned, private alternatives. Mandate IP protection training.', support: 'IT Security', notes: 'A critical risk for an R&D-focused company.' },
  { id: 'AIR-21', risk: 'GxP Risk', category: 'Other Risks', description: 'Use of AI in regulated GxP processes is not properly validated, documented, or controlled, leading to compliance failures.', domain: 'Legal & Regulatory', likelihood: 4, impact: 5, velocity: 3, owner: 'Quality & Regulatory Affairs', mitigation: 'Dompe will integrate AI system validation into the existing GxP validation master plan.', support: 'R&D Team, IT', notes: '' },
  { id: 'AIR-22', risk: 'Vendor Lock-in', category: 'Business/Cost Related Risks', description: 'The company becomes heavily dependent on a single AI vendor, making it costly and difficult to switch to alternatives.', domain: 'Vendor Management', likelihood: 3, impact: 3, velocity: 1, owner: 'IT & Procurement', mitigation: 'Dompe will prioritize vendors with open standards and clear data export policies. Develop a multi-vendor strategy where feasible.', support: 'Functional Business Leaders', notes: '' },
  { id: 'AIR-23', risk: 'Service Discontinuity', category: 'Business/Cost Related Risks', description: 'A vendor’s AI service is suddenly discontinued or changed, disrupting the business processes that rely on it.', domain: 'Vendor Management', likelihood: 2, impact: 4, velocity: 3, owner: 'IT & Procurement', mitigation: 'Dompe will negotiate for longer service termination notice periods and rights to code escrow for critical services.', support: 'Legal & Compliance', notes: '' },
  { id: 'AIR-24', risk: 'Lack of Transparency', category: 'Transparency Risks', description: 'A vendor provides insufficient information about their model’s data, architecture, or performance.', domain: 'Vendor Management', likelihood: 4, impact: 3, velocity: 2, owner: 'IT & Procurement', mitigation: 'Dompe will make transparency a key requirement in vendor RFPs and contracts. Demand "model cards" or similar documentation.', support: 'R&D Team', notes: '' },
  { id: 'AIR-25', risk: 'Limited Customization', category: 'Business/Cost Related Risks', description: 'A vendor’s AI solution is a rigid "one-size-fits-all" offering that cannot be tailored to specific business needs.', domain: 'Vendor Management', likelihood: 2, impact: 2, velocity: 1, owner: 'Functional Business Leader', mitigation: 'Dompe will favor vendors that offer APIs or customization options over closed-box solutions.', support: 'R&D Team', notes: '' },
  { id: 'AIR-26', risk: 'Vendor Compliance Misalignment', category: 'Business/Cost Related Risks', description: 'A vendor’s data handling or security practices do not align with the company’s own compliance requirements.', domain: 'Vendor Management', likelihood: 4, impact: 4, velocity: 3, owner: 'Legal & Compliance', mitigation: 'Dompe will conduct thorough security and compliance assessments of all vendors. Include audit rights in contracts.', support: 'IT Security', notes: '' },
  { id: 'AIR-27', risk: 'Lifecycle Costs', category: 'Business/Cost Related Risks', description: 'The total cost of an AI solution, including data management, maintenance, and retraining, significantly exceeds initial estimates.', domain: 'Operations', likelihood: 3, impact: 3, velocity: 1, owner: 'Finance Department', mitigation: 'Dompe will develop a Total Cost of Ownership (TCO) model for AI projects before approval.', support: 'IT Operations, R&D Team', notes: '' },
  { id: 'AIR-28', risk: 'Sensitive Information Access', category: 'Security and Data Risks', description: 'The AI system requires overly broad access to sensitive data, increasing the attack surface.', domain: 'Data Governance', likelihood: 4, impact: 5, velocity: 4, owner: 'IT Security', mitigation: '8090 will enforce the principle of least privilege for all AI systems and service accounts.', support: 'Data Governance Team', notes: '' },
  { id: 'AIR-29', risk: 'Algorithmic Misjudgment', category: 'AI Human Impact Risks', description: 'The AI makes a critical error in judgment in a high-stakes scenario, such as a medical diagnosis or financial transaction.', domain: 'Ethics & Fairness', likelihood: 3, impact: 5, velocity: 5, owner: 'Functional Business Leader', mitigation: '8090 will implement human-in-the-loop (HITL) workflows for all high-stakes decisions.', support: 'R&D Team', notes: '' },
  { id: 'AIR-30', risk: 'Opaque Decision-Making', category: 'Transparency Risks', description: 'Business leaders use AI recommendations without understanding the underlying reasons, leading to poor strategic choices.', domain: 'Transparency', likelihood: 4, impact: 4, velocity: 2, owner: 'Executive Management', mitigation: 'Dompe will mandate that AI-driven proposals be accompanied by explanations of the model\'s reasoning.', support: 'Data Science Team', notes: '' },
  { id: 'AIR-31', risk: 'Psychological Harm', category: 'AI Human Impact Risks', description: 'Interaction with an AI (e.g., a chatbot) causes distress, anxiety, or other psychological harm to users.', domain: 'Ethics & Fairness', likelihood: 2, impact: 4, velocity: 3, owner: 'HR & Legal', mitigation: '8090 will design AI interactions to be empathetic and provide clear escalation paths to human agents.', support: 'Marketing & Communications', notes: '' },
  { id: 'AIR-32', risk: 'Consent & Transparency Gaps', category: 'Security and Data Risks', description: 'The company fails to obtain proper consent for data usage or is not transparent about how personal data is used in AI models.', domain: 'Data Governance', likelihood: 4, impact: 5, velocity: 4, owner: 'Legal & Compliance', mitigation: 'Dompe will integrate consent management and transparency statements into the design of all AI systems handling personal data.', support: 'Privacy Office', notes: '' },
];

const controlsMappingData = [
  { controlId: 'AIC-001', controlName: 'Data Validation and Bias Testing', description: 'Implement automated checks to identify and mitigate biases in training datasets.', nistCsfFunction: 'Identify', owner: 'R&D Team', implementationStatus: 'Implemented', riskId: 'AIR-02', type: 'Automated Test', dueDate: '2025-08-01' },
  { controlId: 'AIC-002', controlName: 'Fairness Metrics Monitoring', description: 'Continuously monitor key fairness metrics (e.g., demographic parity, equal opportunity) in model outputs.', nistCsfFunction: 'Detect', owner: 'R&D Team', implementationStatus: 'In Progress', riskId: 'AIR-02', type: 'Automated Test', dueDate: '2025-07-15' },
  { controlId: 'AIC-003', controlName: 'Model Performance Monitoring', description: 'Set up automated monitoring for data/concept drift and model accuracy degradation.', nistCsfFunction: 'Detect', owner: 'R&D Team', implementationStatus: 'Implemented', riskId: 'AIR-01', type: 'Automated Test', dueDate: '2025-09-01' },
  { controlId: 'AIC-004', controlName: 'Regular Model Retraining Schedule', description: 'Establish a formal schedule for retraining models with fresh data.', nistCsfFunction: 'Protect', owner: 'R&D Team', implementationStatus: 'In Progress', riskId: 'AIR-03', type: 'Document', dueDate: '2025-06-30' },
  { controlId: 'AIC-005', controlName: 'Data Encryption at Rest and in Transit', description: 'Ensure all data used by AI systems is encrypted using industry-standard protocols.', nistCsfFunction: 'Protect', owner: 'IT', implementationStatus: 'Implemented', riskId: 'AIR-09', type: 'Automated Test', dueDate: '2025-10-01' },
  { controlId: 'AIC-006', controlName: 'Data Anonymization and Pseudonymization', description: 'Apply techniques to de-identify personal data before it is used for training.', nistCsfFunction: 'Protect', owner: 'IT', implementationStatus: 'In Progress', riskId: 'AIR-32', type: 'Document', dueDate: '2025-07-25' },
  { controlId: 'AIC-007', controlName: 'Use of Interpretable Models', description: 'Prioritize inherently interpretable models where possible. For black-box models, use explainability techniques like SHAP or LIME.', nistCsfFunction: 'Identify', owner: 'R&D Team', implementationStatus: 'In Progress', riskId: 'AIR-07', type: 'Document', dueDate: '2025-11-01' },
  { controlId: 'AIC-008', controlName: 'End-User Acceptable Use Policy', description: 'Develop and mandate a policy on appropriate AI tool usage, capabilities, and limitations.', nistCsfFunction: 'Govern', owner: 'HR', implementationStatus: 'Not Implemented', riskId: 'AIR-14', type: 'Document', dueDate: '2025-07-01' },
  { controlId: 'AIC-009', controlName: 'Input Sanitization and Validation', description: 'Implement robust validation on all inputs to the model to detect and block potential adversarial data.', nistCsfFunction: 'Protect', owner: 'IT', implementationStatus: 'In Progress', riskId: 'AIR-11', type: 'Automated Test', dueDate: '2025-08-15' },
  { controlId: 'AIC-010', controlName: 'Regulatory Watch Tower', description: 'Maintain a process for monitoring changes in AI-related laws and regulations.', nistCsfFunction: 'Identify', owner: 'Legal & Compliance', implementationStatus: 'Implemented', riskId: 'AIR-13', type: 'Document', dueDate: '2025-12-31' },
  { controlId: 'AIC-011', controlName: 'Human-in-the-Loop (HITL) Workflow', description: 'For critical decisions, ensure a human operator reviews and approves the AI-recommended action.', nistCsfFunction: 'Respond', owner: 'Functional Business Leader', implementationStatus: 'Implemented', riskId: 'AIR-29', type: 'Document', dueDate: '2025-09-15' },
  { controlId: 'AIC-012', controlName: 'Ethical Review Board', description: 'Establish a cross-functional board to review high-risk AI projects before deployment.', nistCsfFunction: 'Govern', owner: 'Legal & Compliance', implementationStatus: 'Implemented', riskId: 'AIR-02', type: 'Document', dueDate: '2025-06-01' },
  { controlId: 'AIC-013', controlName: 'Role-Based Access Control (RBAC)', description: 'Enforce strict access controls to data and models based on the principle of least privilege.', nistCsfFunction: 'Protect', owner: 'IT', implementationStatus: 'Implemented', riskId: 'AIR-12', type: 'Automated Test', dueDate: '2025-10-10' },
  { controlId: 'AIC-014', controlName: 'Vendor Security Assessment', description: 'Conduct thorough security and compliance reviews of all third-party AI vendors before procurement.', nistCsfFunction: 'Govern', owner: 'IT', implementationStatus: 'Implemented', riskId: 'AIR-26', type: 'Document', dueDate: '2025-12-01' },
  { controlId: 'AIC-015', controlName: 'AI Disclosure Policy', description: 'Establish clear guidelines on when and how to disclose the use of AI to customers and users.', nistCsfFunction: 'Govern', owner: 'Legal & Compliance', implementationStatus: 'In Progress', riskId: 'AIR-08', type: 'Document', dueDate: '2025-08-20' },
  { controlId: 'AIC-016', controlName: 'GxP Validation Master Plan', description: 'Maintain a master plan for validating AI systems used in GxP-regulated environments.', nistCsfFunction: 'Protect', owner: 'Quality & Regulatory Affairs', implementationStatus: 'Implemented', riskId: 'AIR-21', type: 'Document', dueDate: '2026-01-15' },
  { controlId: 'AIC-017', controlName: 'IP Protection Training', description: 'Train employees on the risks of entering sensitive company data into public AI models.', nistCsfFunction: 'Protect', owner: 'HR', implementationStatus: 'Implemented', riskId: 'AIR-20', type: 'Document', dueDate: '2025-09-01' },
  { controlId: 'AIC-018', controlName: 'Service Level Agreement (SLA) Monitoring', description: 'Actively monitor vendor SLAs for AI service availability and performance.', nistCsfFunction: 'Detect', owner: 'IT', implementationStatus: 'Implemented', riskId: 'AIR-05', type: 'Automated Test', dueDate: '2025-11-11' }
];


// --- Helper Functions & Components ---

const getRiskLevel = (score) => {
    if (score >= 20) return { label: 'Critical', color: 'red', tagClasses: 'bg-red-100 text-red-700' };
    if (score >= 15) return { label: 'High', color: 'orange', tagClasses: 'bg-orange-100 text-orange-700' };
    if (score >= 8) return { label: 'Medium', color: 'yellow', tagClasses: 'bg-yellow-100 text-yellow-700' };
    return { label: 'Low', color: 'green', tagClasses: 'bg-green-100 text-green-700' };
};

const getControlStatus = (control) => {
    const today = new Date();
    const dueDate = new Date(control.dueDate);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (control.implementationStatus === 'Implemented') {
        return { label: 'OK', tagClasses: 'bg-green-100 text-green-700' };
    }
    if (diffDays < 0) {
        return { label: 'Overdue', tagClasses: 'bg-red-100 text-red-700' };
    }
    if (diffDays <= 30) {
        return { label: 'Due soon', tagClasses: 'bg-yellow-100 text-yellow-700' };
    }
    return { label: control.implementationStatus, tagClasses: 'bg-gray-100 text-gray-600' };
};

const Tag = ({ children, className }) => (
    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${className}`}>
        {children}
    </span>
);

const Icon = ({ path, className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d={path} clipRule="evenodd" />
    </svg>
);

const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-4">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-gray-500">Generating...</span>
    </div>
);

// --- Main Views & Components ---

const Sidebar = ({ activeView, setActiveView }) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'M2.25 12l8.954-8.955a.75.75 0 011.06 0l8.955 8.955a.75.75 0 01-1.06 1.06L12 4.061 3.31 12.75a.75.75 0 01-1.06-1.06zM12 21.75a.75.75 0 01-.75-.75V12h1.5v9a.75.75 0 01-.75.75z' },
        { id: 'risk_management', label: 'Risk Management', icon: 'M12 1.5a.75.75 0 01.75.75V7.5h-1.5V2.25A.75.75 0 0112 1.5zM12 22.5a.75.75 0 01-.75-.75v-6h1.5v6a.75.75 0 01-.75.75zM4.5 12a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5zM21 12a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5zM6.31 6.31a.75.75 0 00-1.06-1.06L3.5 7.001a.75.75 0 001.06 1.06l1.75-1.75zm12.44 0a.75.75 0 00-1.06 1.06l1.75 1.75a.75.75 0 001.06-1.06l-1.75-1.75zM6.31 18.75a.75.75 0 001.06-1.06l-1.75-1.75a.75.75 0 10-1.06 1.06l1.75 1.75zm12.44 0a.75.75 0 001.06 1.06l1.75-1.75a.75.75 0 10-1.06-1.06l-1.75 1.75z' },
        { id: 'controls', label: 'Controls', icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.016h-.008v-.016z' },
        { id: 'personnel', label: 'Personnel', icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-8.037c-1.172-1.263-2.992-2.2-5.051-2.48a.75.75 0 00-.475.72V19.128zM9 12.75a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75zM9 15.75a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75zM6 10.875a.75.75 0 01.75-.75h.008a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75zM6 13.875a.75.75 0 01.75-.75h.008a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75zM6 16.875a.75.75 0 01.75-.75h.008a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75zM9.75 8.25A.75.75 0 009 9v10.188a2.25 2.25 0 001.992 2.181.75.75 0 00.758-.515c.308-1.11.308-2.28 0-3.39a.75.75 0 00-.75-.632H9.75V8.25z' },
    ];
    return (
        <aside className="fixed inset-y-0 left-0 z-10 w-64 flex-col border-r border-gray-200 bg-gray-900 text-white hidden md:flex">
            <div className="flex items-center h-16 flex-shrink-0 px-4">
                <h1 className="text-2xl font-bold">8090<span className="text-blue-500">Dompe</span></h1>
            </div>
            <nav className="flex flex-1 flex-col mt-4">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                        <ul role="list" className="-mx-2 space-y-1">
                            {navItems.map((item) => (
                                <li key={item.id}>
                                    <a href="#" onClick={(e) => { e.preventDefault(); setActiveView({ view: item.id }); }}
                                       className={`flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${activeView.view === item.id ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                                        <Icon path={item.icon} className="h-6 w-6 shrink-0" />
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

const Dashboard = ({ setActiveView }) => {
    const risksWithScores = useMemo(() => riskMapData.map(r => ({ ...r, score: r.likelihood * r.impact })), []);
    const riskCounts = useMemo(() => {
        const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
        risksWithScores.forEach(r => {
            const level = getRiskLevel(r.score).label;
            counts[level]++;
        });
        return counts;
    }, [risksWithScores]);

    const controlStatusCounts = useMemo(() => {
        const uniqueControls = {};
        controlsMappingData.forEach(c => {
            if (!uniqueControls[c.controlId]) {
                uniqueControls[c.controlId] = c.implementationStatus;
            }
        });
        const counts = { Implemented: 0, 'In Progress': 0, 'Not Implemented': 0 };
        Object.values(uniqueControls).forEach(status => {
            if (counts[status] !== undefined) {
                counts[status]++;
            }
        });
        return counts;
    }, []);
    
    const totalControls = Object.keys(controlStatusCounts).reduce((sum, key) => sum + controlStatusCounts[key], 0);
    const implementedPercentage = totalControls > 0 ? Math.round((controlStatusCounts.Implemented / totalControls) * 100) : 0;

    const topRisks = useMemo(() => [...risksWithScores].sort((a, b) => b.score - a.score).slice(0, 5), [risksWithScores]);

    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border bg-white p-6">
                    <h3 className="text-base font-medium text-gray-500">Overall Risk Posture</h3>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">{risksWithScores.length} Total Risks</p>
                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                        {Object.entries(riskCounts).map(([level, count]) => (
                            count > 0 && <div key={level} className="flex items-center text-sm">
                                <span className={`h-2 w-2 rounded-full mr-1.5 bg-${getRiskLevel(level === 'Critical' ? 20 : level === 'High' ? 15 : level === 'Medium' ? 8 : 0).color}-500`}></span>
                                <span className="text-gray-600">{level}: {count}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="rounded-lg border bg-white p-6">
                    <h3 className="text-base font-medium text-gray-500">Controls Status</h3>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">{implementedPercentage}%</p>
                    <p className="text-sm text-gray-500">Implemented ({controlStatusCounts.Implemented} of {totalControls})</p>
                </div>
                <div className="rounded-lg border bg-white p-6">
                    <h3 className="text-base font-medium text-gray-500">Top Priority Risks</h3>
                     <ul className="mt-2 space-y-2">
                        {topRisks.map(risk => (
                            <li key={risk.id} className="flex items-center justify-between text-sm">
                                <a href="#" onClick={(e) => { e.preventDefault(); setActiveView({ view: 'risk_detail', id: risk.id }); }} className="text-blue-600 hover:underline truncate pr-2">{risk.risk}</a>
                                <Tag className={getRiskLevel(risk.score).tagClasses}>{getRiskLevel(risk.score).label}</Tag>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const RiskRegisterTable = ({ risks, setActiveView }) => (
    <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Risk Title</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Risk Category</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Risk Owner</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Risk Level</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Controls</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {risks.map((risk) => (
                            <tr key={risk.id} className="hover:bg-gray-50">
                                <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                    <a href="#" onClick={(e) => { e.preventDefault(); setActiveView({ view: 'risk_detail', id: risk.id }); }} className="text-blue-600 hover:underline">{risk.risk}</a>
                                </td>
                                <td className="px-3 py-4 text-sm text-gray-500">{risk.category}</td>
                                <td className="px-3 py-4 text-sm text-gray-500">{risk.owner}</td>
                                <td className="px-3 py-4 text-sm">
                                    <Tag className={getRiskLevel(risk.score).tagClasses}>{getRiskLevel(risk.score).label}</Tag>
                                </td>
                                <td className="px-3 py-4 text-sm text-gray-500 text-center">{risk.controlCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

const ControlsView = ({ setActiveView }) => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const uniqueControls = useMemo(() => {
        const controlMap = new Map();
        controlsMappingData.forEach(c => {
            const risk = riskMapData.find(r => r.id === c.riskId);
            const category = risk ? risk.category : 'Uncategorized';
            if (!controlMap.has(c.controlId)) {
                controlMap.set(c.controlId, { ...c, category: category, riskIds: new Set() });
            }
            controlMap.get(c.controlId).riskIds.add(c.riskId);
        });
        return Array.from(controlMap.values());
    }, []);

    const categories = useMemo(() => {
        const counts = { 'All': uniqueControls.length };
        uniqueControls.forEach(control => {
            counts[control.category] = (counts[control.category] || 0) + 1;
        });
        return counts;
    }, [uniqueControls]);

    const filteredControls = useMemo(() => {
        return uniqueControls.filter(control => {
            const categoryMatch = activeCategory === 'All' || control.category === activeCategory;
            const searchMatch = searchTerm === '' || control.controlName.toLowerCase().includes(searchTerm.toLowerCase());
            return categoryMatch && searchMatch;
        });
    }, [uniqueControls, activeCategory, searchTerm]);

    const stats = useMemo(() => {
        const ok = filteredControls.filter(c => c.implementationStatus === 'Implemented').length;
        const needsAttention = filteredControls.length - ok;
        const overdue = filteredControls.filter(c => getControlStatus(c).label === 'Overdue').length;
        const dueSoon = filteredControls.filter(c => getControlStatus(c).label === 'Due soon').length;
        return { ok, needsAttention, overdue, dueSoon, total: filteredControls.length };
    }, [filteredControls]);

    return (
        <div className="flex">
            {/* Left Sidebar for Categories */}
            <aside className="w-64 flex-shrink-0 pr-8">
                <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Top Gen AI Risk Categories</h3>
                <div className="mt-2 space-y-1">
                    {Object.entries(categories).map(([name, count]) => (
                        <a key={name} href="#" onClick={e => { e.preventDefault(); setActiveCategory(name); }}
                           className={`group flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md ${activeCategory === name ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <span className="truncate">{name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${activeCategory === name ? 'bg-white' : 'bg-gray-200 group-hover:bg-gray-300'}`}>{count}</span>
                        </a>
                    ))}
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">Controls</h1>
                
                {/* Stats Header */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold">OK</h4>
                            <span className="font-semibold">{stats.ok}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${stats.total > 0 ? (stats.ok / stats.total) * 100 : 0}%` }}></div>
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold">Needs attention</h4>
                            <span className="font-semibold">{stats.needsAttention}</span>
                        </div>
                        <div className="mt-3 space-y-1 text-sm text-gray-600">
                            <p className="flex justify-between"><span>Overdue</span> <span>{stats.overdue}</span></p>
                            <p className="flex justify-between"><span>Due soon</span> <span>{stats.dueSoon}</span></p>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="mt-6">
                    <input
                        type="text"
                        placeholder="Search controls..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Controls Table */}
                <div className="mt-6 overflow-hidden border border-gray-200 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Owner</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Due Date</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Framework</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {filteredControls.map((control) => {
                                const status = getControlStatus(control);
                                return (
                                    <tr key={control.controlId} className="hover:bg-gray-50">
                                        <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{control.controlName}</td>
                                        <td className="px-3 py-4 text-sm text-gray-500">{control.owner}</td>
                                        <td className="px-3 py-4 text-sm text-gray-500">{control.type}</td>
                                        <td className="px-3 py-4 text-sm"><Tag className={status.tagClasses}>{status.label}</Tag></td>
                                        <td className="px-3 py-4 text-sm text-gray-500">{new Date(control.dueDate).toLocaleDateString()}</td>
                                        <td className="px-3 py-4 text-sm text-gray-500">{control.nistCsfFunction}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


const RiskManagement = ({ setActiveView }) => {
    const risksWithScoresAndControls = useMemo(() => {
        return riskMapData.map(risk => {
            const score = risk.likelihood * risk.impact;
            const controlCount = controlsMappingData.filter(c => c.riskId === risk.id).length;
            return { ...risk, score, controlCount };
        }).sort((a,b) => b.score - a.score);
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">Risk Register</h1>
            <div className="mt-6">
                <RiskRegisterTable risks={risksWithScoresAndControls} setActiveView={setActiveView} />
            </div>
        </div>
    );
};

const RiskDetailView = ({ riskId, setActiveView }) => {
    const risk = riskMapData.find(r => r.id === riskId);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedSummary, setGeneratedSummary] = useState('');
    const [error, setError] = useState('');

    if (!risk) return <div>Risk not found.</div>;

    const score = risk.likelihood * risk.impact;
    const riskLevel = getRiskLevel(score);
    const linkedControls = controlsMappingData.filter(c => c.riskId === riskId);

    const handleGenerateSummary = async () => {
        setIsGenerating(true);
        setError('');
        setGeneratedSummary('');

        const promptText = `Generate a concise, one-paragraph executive summary for the following AI risk. Focus on the business impact and the core mitigation strategy. Risk: "${risk.risk}". Description: "${risk.description}". Current Mitigation: "${risk.mitigation}"`;

        try {
            const chatHistory = [{ role: "user", parts: [{ text: promptText }] }];
            const payload = { contents: chatHistory };
            const apiKey = ""; 
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                setGeneratedSummary(text);
            } else {
                throw new Error("Unexpected API response structure.");
            }

        } catch (err) {
            setError(err.message);
            console.error("Error calling Gemini API:", err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div>
            <button onClick={() => setActiveView({ view: 'risk_management' })} className="mb-4 text-sm text-blue-600 hover:underline">&larr; Back to Risk Register</button>
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <div className="flex items-start justify-between">
                        <div>
                           <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:tracking-tight">{risk.risk}</h2>
                           <p className="text-sm text-gray-500 mt-1">{risk.id} &bull; {risk.category}</p>
                        </div>
                        <Tag className={riskLevel.tagClasses}>{riskLevel.label}</Tag>
                    </div>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200">
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Risk Description</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 whitespace-pre-wrap">{risk.description}</dd>
                        </div>
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Proposed Oversight Ownership</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{risk.owner}</dd>
                        </div>
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Scoring</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                Likelihood: {risk.likelihood}, Impact: {risk.impact}, Velocity: {risk.velocity} &mdash; <span className="font-bold">Total Score: {score}</span>
                            </dd>
                        </div>
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Agreed Workable Mitigation</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 whitespace-pre-wrap">{risk.mitigation || 'N/A'}</dd>
                        </div>
                         <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Proposed Support</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{risk.support || 'N/A'}</dd>
                        </div>
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Notes</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 whitespace-pre-wrap">{risk.notes || 'N/A'}</dd>
                        </div>
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Linked Controls ({linkedControls.length})</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                <ul role="list" className="divide-y divide-gray-200 rounded-md border border-gray-200">
                                    {linkedControls.length > 0 ? linkedControls.map(control => (
                                        <li key={control.controlId} className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                                            <div className="flex w-0 flex-1 items-center">
                                                <a href="#" onClick={(e) => { e.preventDefault(); setActiveView({ view: 'control_detail', id: control.controlId }); }} className="ml-2 w-0 flex-1 truncate font-medium text-blue-600 hover:underline">
                                                    {control.controlName}
                                                </a>
                                            </div>
                                            <div className="ml-4 flex-shrink-0">
                                                <Tag className={getControlStatus(control).tagClasses}>{getControlStatus(control).label}</Tag>
                                            </div>
                                        </li>
                                    )) : <li className="px-3 py-2 text-gray-500">No controls linked.</li>}
                                </ul>
                            </dd>
                        </div>
                        {/* Gemini API Features */}
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">AI Assistant</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                <div className="flex space-x-2">
                                    <button onClick={handleGenerateSummary} disabled={isGenerating} className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                                        📄 Generate Executive Summary
                                    </button>
                                </div>
                                {isGenerating && <LoadingSpinner />}
                                {error && <p className="mt-2 text-sm text-red-600">Error: {error}</p>}
                                {generatedSummary && (
                                    <div className="mt-4 p-4 border rounded-md bg-gray-50">
                                        <h4 className="font-bold text-sm">AI-Generated Executive Summary:</h4>
                                        <p className="mt-1 text-sm whitespace-pre-wrap">{generatedSummary}</p>
                                    </div>
                                )}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
};

const ControlDetailView = ({ controlId, setActiveView }) => {
    const control = controlsMappingData.find(c => c.controlId === controlId);
    if (!control) return <div>Control not found.</div>;

    const linkedRisks = controlsMappingData
        .filter(c => c.controlId === controlId)
        .map(c => riskMapData.find(r => r.id === c.riskId))
        .filter(Boolean);

    return (
         <div>
            <button onClick={() => setActiveView({ view: 'controls' })} className="mb-4 text-sm text-blue-600 hover:underline">&larr; Back to Controls</button>
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <div className="flex items-start justify-between">
                        <div>
                           <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:tracking-tight">{control.controlName}</h2>
                           <p className="text-sm text-gray-500 mt-1">{control.controlId} &bull; {control.nistCsfFunction}</p>
                        </div>
                        <Tag className={getControlStatus(control).tagClasses}>{getControlStatus(control).label}</Tag>
                    </div>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200">
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Control Description</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{control.description}</dd>
                        </div>
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Mitigated Risks ({linkedRisks.length})</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                <ul role="list" className="divide-y divide-gray-200 rounded-md border border-gray-200">
                                    {linkedRisks.map(risk => {
                                        const score = risk.likelihood * risk.impact;
                                        const riskLevel = getRiskLevel(score);
                                        return (
                                            <li key={risk.id} className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                                                <div className="flex w-0 flex-1 items-center">
                                                    <a href="#" onClick={(e) => { e.preventDefault(); setActiveView({ view: 'risk_detail', id: risk.id }); }} className="ml-2 w-0 flex-1 truncate font-medium text-blue-600 hover:underline">
                                                        {risk.risk}
                                                    </a>
                                                </div>
                                                <div className="ml-4 flex-shrink-0">
                                                    <Tag className={riskLevel.tagClasses}>{riskLevel.label}</Tag>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
};


export default function App() {
    const [activeView, setActiveView] = useState({ view: 'controls' });

    const renderContent = () => {
        switch (activeView.view) {
            case 'dashboard':
                return <Dashboard setActiveView={setActiveView} />;
            case 'risk_management':
                return <RiskManagement setActiveView={setActiveView} />;
            case 'controls':
                return <ControlsView setActiveView={setActiveView} />;
            case 'risk_detail':
                return <RiskDetailView riskId={activeView.id} setActiveView={setActiveView} />;
            case 'control_detail':
                 return <ControlDetailView controlId={activeView.id} setActiveView={setActiveView} />;
            default:
                return <ControlsView setActiveView={setActiveView} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <script src="https://cdn.tailwindcss.com"></script>
            <Sidebar activeView={activeView} setActiveView={setActiveView} />
            <main className="md:pl-64">
                <div className="px-4 py-10 sm:px-6 lg:px-8">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}
