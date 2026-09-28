import { AIProvider, DesignPromptResult, MeasurementExtractionResult, MeasurementAdvisorResult, DesignRefinementResult } from './provider.interface';
export declare class GeminiService implements AIProvider {
    private genAI;
    private model;
    private isAvailable;
    constructor();
    private callGemini;
    private parseJsonFromResponse;
    generateDesignFromPrompt(prompt: string, context?: Record<string, unknown>): Promise<DesignPromptResult>;
    extractMeasurementsFromDescription(description: string): Promise<MeasurementExtractionResult>;
    adviseMeasurements(height: number, weight: number, gender: 'male' | 'female', garment: string): Promise<MeasurementAdvisorResult>;
    private fallbackMeasurementAdvice;
    refineDesign(currentSpec: Record<string, unknown>, instruction: string): Promise<DesignRefinementResult>;
    interpretReferenceDescription(description: string): Promise<DesignPromptResult>;
    private fallbackDesignGeneration;
    get available(): boolean;
}
export declare const geminiService: GeminiService;
//# sourceMappingURL=gemini.service.d.ts.map