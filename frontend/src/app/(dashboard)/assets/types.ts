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
    identifier?: string | null;
    identifierType?: string | null;
    title?: string | null;

    path: string;
    startLine: number | null;
    startColumn: number | null;
    endLine: number | null;
    endColumn: number | null;

    message: string;

    category: string;
    severity: string;
    confidence: string;
    impact: string;

    cwe: string;
    owasp: string;
    vulnerabilityClass: string;

    packageName?: string | null;
    installedVersion?: string | null;
    fixedVersion?: string | null;
    status?: string | null;

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