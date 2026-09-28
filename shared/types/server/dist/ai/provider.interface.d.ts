export interface DesignPromptResult {
    structuredSpec: Record<string, unknown>;
    summary: string;
    suggestions: string[];
    tokensUsed?: number;
    model: string;
}
export interface MeasurementExtractionResult {
    estimates: Record<string, number>;
    confidence: number;
    notes: string;
    tokensUsed?: number;
    model: string;
}
export interface MeasurementAdvisorResult {
    estimates: Record<string, number>;
    recommendedFabricMeters: number;
    confidence: number;
    notes: string;
    model: string;
}
export interface DesignRefinementResult {
    updatedSpec: Record<string, unknown>;
    changeDescription: string;
    suggestions: string[];
    tokensUsed?: number;
    model: string;
}
export interface AIProvider {
    generateDesignFromPrompt(prompt: string, context?: Record<string, unknown>): Promise<DesignPromptResult>;
    extractMeasurementsFromDescription(description: string): Promise<MeasurementExtractionResult>;
    adviseMeasurements(height: number, weight: number, gender: 'male' | 'female', garment: string): Promise<MeasurementAdvisorResult>;
    refineDesign(currentSpec: Record<string, unknown>, instruction: string): Promise<DesignRefinementResult>;
    interpretReferenceDescription(description: string): Promise<DesignPromptResult>;
}
//# sourceMappingURL=provider.interface.d.ts.map