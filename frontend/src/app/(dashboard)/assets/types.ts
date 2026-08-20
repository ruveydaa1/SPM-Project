export type Asset = {
    id: number;
    name: string;
    type: string;
    url: string;
    description: string;
    isActive: boolean;
    scanSource: string;
    createdAt: string;
    updatedAt: string;
};

export type Finding = {
    id: number;
    assetId: number;
    scanRunId: number;

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

    cwe: string;
    owasp: string;
    vulnerabilityClass: string;

    reference: string;

    createdAt: string;
};

export type ScanRun = {
    id: number;
    assetId: number;
    scanner: string;
    source: string;
    status: string;
    startedAt: string;
    completedAt: string | null;
    error: string;
    findings: Finding[];
};

export type ScanResult = {
    success: boolean;
    scanner: string;
    source: string;
    scanTime: string;
    findings: Finding[];
    error?: string;
};