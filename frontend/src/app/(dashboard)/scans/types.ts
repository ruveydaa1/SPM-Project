export interface ScanFinding {
    checkId: string;
    path: string;
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
    message: string;
    category: string;
    severity: string;
    confidence: string;
    impact: string;
    cwe: string[];
    owasp: string[];
    vulnerabilityClass: string;
    reference: string;
}

export interface ScanRun {
    id: number;
    assetId: number;
    scanner: string;
    source: string;
    status: string;
    startedAt: string;
    completedAt: string | null;
    error: string | null;
    findings: ScanFinding[];
}