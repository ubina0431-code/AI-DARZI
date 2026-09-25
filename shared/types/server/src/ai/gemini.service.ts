import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { config } from '../config';
import {
  AIProvider,
  DesignPromptResult,
  MeasurementExtractionResult,
  MeasurementAdvisorResult,
  DesignRefinementResult,
} from './provider.interface';

const DESIGN_SYSTEM_PROMPT = `You are an expert Pakistani/South Asian fashion designer AI assistant for "AI Darzi" tailoring platform.

Your role is to convert natural language clothing descriptions into structured JSON design specifications for Pakistani/South Asian outfits.

Pakistani outfit components include:
- KAMEEZ/KURTA styles: straight, A-line, angrakha, anarkali, frock, peplum, long, short, panelled, asymmetrical, open front
- BOTTOM styles: straight trouser, cigarette trouser, wide-leg, palazzo, shalwar, tulip shalwar, dhoti shalwar, gharara, sharara, churidar
- DUPATTA fabrics: chiffon, organza, silk, lawn, net, printed, embroidered
- Necklines: round, V-neck, boat neck, sweetheart, collar, keyhole, U-neck
- Sleeve types: full, 3/4, half, sleeveless, bell, flutter, bishop
- Embroidery: zari, thread, mirror work, dabka, resham, gota, sequins, tilla
- Fabrics: lawn, chiffon, georgette, silk, velvet, organza, net, khaddar, linen, karandi

Always respond with ONLY valid JSON matching the design specification schema. Do not include any explanatory text outside the JSON.`;

const MEASUREMENT_SYSTEM_PROMPT = `You are an AI measurement assistant for AI Darzi. 
When given body description information, provide estimated measurements in inches as structured JSON.
Always include a confidence score (0-100) and notes about accuracy limitations.
IMPORTANT: These are ESTIMATES only and must be verified by the customer.`;

const ADVISOR_SYSTEM_PROMPT = `You are a Pakistani tailoring measurement advisor. Estimate standard baseline suit measurements in inches from height and weight. Return only valid JSON with estimates for shoulder, chest, waist, sleeve, kameezeLength, trouserLength, recommendedFabricMeters, confidence, and notes. These are estimates and must be verified by a tailor.`;

export class GeminiService implements AIProvider {
  private genAI: GoogleGenerativeAI | null = null;
  private model: string = 'gemini-1.5-flash';
  private isAvailable: boolean = false;

  constructor() {
    if (config.geminiApiKey && config.geminiApiKey.length > 10) {
      try {
        this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
        this.isAvailable = true;
        console.log('✅ Gemini AI initialized');
      } catch (err) {
        console.warn('⚠️  Gemini AI initialization failed. AI features will use fallback mode.');
        this.isAvailable = false;
      }
    } else {
      console.warn('⚠️  GEMINI_API_KEY not configured. AI features will use fallback mode.');
    }
  }

  private async callGemini(systemPrompt: string, userPrompt: string): Promise<{ text: string; tokensUsed?: number }> {
    if (!this.genAI || !this.isAvailable) {
      throw new Error('Gemini AI is not available. Please configure GEMINI_API_KEY.');
    }

    const model = this.genAI.getGenerativeModel({
      model: this.model,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
    });

    const prompt = `${systemPrompt}\n\nUser request: ${userPrompt}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      text,
      tokensUsed: response.usageMetadata?.totalTokenCount,
    };
  }

  private parseJsonFromResponse(text: string): Record<string, unknown> {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonString = jsonMatch ? jsonMatch[1] : text;

    try {
      return JSON.parse(jsonString.trim());
    } catch {
      // Try to find JSON object in text
      const objMatch = jsonString.match(/\{[\s\S]*\}/);
      if (objMatch) {
        return JSON.parse(objMatch[0]);
      }
      throw new Error('Could not parse JSON from AI response');
    }
  }

  async generateDesignFromPrompt(prompt: string, context?: Record<string, unknown>): Promise<DesignPromptResult> {
    const contextStr = context ? `\nContext: ${JSON.stringify(context)}` : '';
    const fullPrompt = `${prompt}${contextStr}

Return a JSON object with these fields:
{
  "occasion": "string",
  "garmentType": "two_piece|three_piece|one_piece",
  "kameez": {
    "style": "string",
    "length": "string", 
    "neckline": "string",
    "sleeves": "string",
    "cuffs": "string",
    "embroidery": "string",
    "fabric": "string"
  },
  "bottom": {
    "style": "string",
    "fabric": "string",
    "embroidery": "string"
  },
  "dupatta": {
    "fabric": "string",
    "embroidery": "string",
    "border": "string"
  },
  "colors": ["array of colors"],
  "primaryColor": "string",
  "summary": "brief design description",
  "suggestions": ["3 styling suggestions"]
}`;

    try {
      const { text, tokensUsed } = await this.callGemini(DESIGN_SYSTEM_PROMPT, fullPrompt);
      const parsed = this.parseJsonFromResponse(text);

      return {
        structuredSpec: parsed,
        summary: (parsed.summary as string) || 'Custom design created from your description',
        suggestions: (parsed.suggestions as string[]) || [],
        tokensUsed,
        model: this.model,
      };
    } catch (error) {
      console.error('Gemini design generation error:', error);
      // Graceful fallback - return a basic structure
      return this.fallbackDesignGeneration(prompt);
    }
  }

  async extractMeasurementsFromDescription(description: string): Promise<MeasurementExtractionResult> {
    const fullPrompt = `Based on this body description: "${description}"

Provide estimated measurements in inches as JSON:
{
  "estimates": {
    "shoulder": number,
    "chest": number,
    "waist": number,
    "hip": number,
    "sleeve": number,
    "kameezeLength": number,
    "trouserLength": number,
    "neck": number
  },
  "confidence": number (0-100),
  "notes": "disclaimer about accuracy"
}`;

    try {
      const { text, tokensUsed } = await this.callGemini(MEASUREMENT_SYSTEM_PROMPT, fullPrompt);
      const parsed = this.parseJsonFromResponse(text);

      return {
        estimates: (parsed.estimates as Record<string, number>) || {},
        confidence: (parsed.confidence as number) || 50,
        notes: (parsed.notes as string) || 'These are AI estimates. Please verify all measurements manually.',
        tokensUsed,
        model: this.model,
      };
    } catch (error) {
      console.error('Gemini measurement extraction error:', error);
      return {
        estimates: {},
        confidence: 0,
        notes: 'AI measurement extraction unavailable. Please enter measurements manually.',
        model: this.model,
      };
    }
  }

  async adviseMeasurements(height: number, weight: number, gender: 'male' | 'female', garment: string): Promise<MeasurementAdvisorResult> {
    const fullPrompt = `Height: ${height} cm. Weight: ${weight} kg. Gender: ${gender}. Garment: ${garment}. Estimate a standard baseline suit measurement set and fabric requirement.`;

    if (this.genAI && this.isAvailable) {
      try {
        const { text } = await this.callGemini(ADVISOR_SYSTEM_PROMPT, fullPrompt);
        const parsed = this.parseJsonFromResponse(text);
        const estimates = parsed.estimates as Record<string, number>;
        return {
          estimates,
          recommendedFabricMeters: Number(parsed.recommendedFabricMeters) || 4.5,
          confidence: Number(parsed.confidence) || 60,
          notes: (parsed.notes as string) || 'AI estimate. Verify with a tailor before cutting fabric.',
          model: this.model,
        };
      } catch (error) {
        console.error('Gemini measurement advisor error:', error);
      }
    }

    return this.fallbackMeasurementAdvice(height, weight, gender);
  }

  private fallbackMeasurementAdvice(height: number, weight: number, gender: 'male' | 'female'): MeasurementAdvisorResult {
    const heightInches = height / 2.54;
    const bmiAdjustment = Math.max(-2, Math.min(4, (weight - 65) * 0.06));
    const isFemale = gender === 'female';
    const estimates = {
      shoulder: Number((isFemale ? 15.5 : 17.5 + bmiAdjustment * 0.15).toFixed(1)),
      chest: Number((isFemale ? 36 + bmiAdjustment * 1.5 : 40 + bmiAdjustment * 1.8).toFixed(1)),
      waist: Number((isFemale ? 30 + bmiAdjustment * 1.5 : 34 + bmiAdjustment * 1.6).toFixed(1)),
      sleeve: Number(((heightInches * 0.35) + (isFemale ? 0 : 0.5)).toFixed(1)),
      kameezeLength: Number(((heightInches * (isFemale ? 0.43 : 0.41))).toFixed(1)),
      trouserLength: Number(((heightInches * 0.56)).toFixed(1)),
    };

    return {
      estimates,
      recommendedFabricMeters: Number((isFemale ? 4.5 : 4.25).toFixed(1)),
      confidence: 55,
      notes: 'Baseline mock estimate because Gemini is not configured. Please verify every measurement with a tailor.',
      model: 'fallback',
    };
  }

  async refineDesign(currentSpec: Record<string, unknown>, instruction: string): Promise<DesignRefinementResult> {
    const fullPrompt = `Current design specification:
${JSON.stringify(currentSpec, null, 2)}

Customer instruction: "${instruction}"

Update the design based on the instruction. Return:
{
  "updatedSpec": { ...updated full design specification },
  "changeDescription": "what was changed",
  "suggestions": ["2-3 additional suggestions"]
}`;

    try {
      const { text, tokensUsed } = await this.callGemini(DESIGN_SYSTEM_PROMPT, fullPrompt);
      const parsed = this.parseJsonFromResponse(text);

      return {
        updatedSpec: (parsed.updatedSpec as Record<string, unknown>) || currentSpec,
        changeDescription: (parsed.changeDescription as string) || `Applied: ${instruction}`,
        suggestions: (parsed.suggestions as string[]) || [],
        tokensUsed,
        model: this.model,
      };
    } catch (error) {
      console.error('Gemini refinement error:', error);
      return {
        updatedSpec: currentSpec,
        changeDescription: `Change requested: ${instruction} (AI processing unavailable)`,
        suggestions: [],
        model: this.model,
      };
    }
  }

  async interpretReferenceDescription(description: string): Promise<DesignPromptResult> {
    return this.generateDesignFromPrompt(
      `Create a design interpretation based on this reference description: ${description}`,
      { source: 'reference_image_description' }
    );
  }

  private fallbackDesignGeneration(prompt: string): DesignPromptResult {
    const lowerPrompt = prompt.toLowerCase();

    const spec: Record<string, unknown> = {
      occasion: lowerPrompt.includes('eid') ? 'Eid' : lowerPrompt.includes('wedding') ? 'Wedding' : 'Casual',
      garmentType: 'three_piece',
      kameez: {
        style: lowerPrompt.includes('anarkali') ? 'anarkali' : lowerPrompt.includes('straight') ? 'straight' : 'A-line',
        length: lowerPrompt.includes('long') ? 'long' : 'mid-length',
        neckline: 'round',
        sleeves: lowerPrompt.includes('sleeveless') ? 'sleeveless' : 'full',
        fabric: lowerPrompt.includes('chiffon') ? 'chiffon' : lowerPrompt.includes('silk') ? 'silk' : 'lawn',
        embroidery: lowerPrompt.includes('heavy') ? 'heavy embroidery' : 'light embroidery',
      },
      bottom: {
        style: lowerPrompt.includes('palazzo') ? 'palazzo' : lowerPrompt.includes('shalwar') ? 'shalwar' : 'straight trouser',
        fabric: 'matching',
      },
      dupatta: {
        fabric: lowerPrompt.includes('organza') ? 'organza' : 'chiffon',
        embroidery: 'border embroidery',
      },
      primaryColor: lowerPrompt.includes('green') ? 'dark green' : lowerPrompt.includes('red') ? 'red' : lowerPrompt.includes('blue') ? 'blue' : 'maroon',
      colors: ['primary color', 'gold accent'],
    };

    return {
      structuredSpec: spec,
      summary: `Custom design based on: "${prompt.substring(0, 100)}"`,
      suggestions: [
        'Consider adding zari embroidery for a festive look',
        'Pair with statement jewelry',
        'Match dupatta border with trouser color',
      ],
      model: 'fallback',
    };
  }

  get available(): boolean {
    return this.isAvailable;
  }
}

export const geminiService = new GeminiService();
