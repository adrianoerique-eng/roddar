import { GoogleGenAI, Type } from "@google/genai";

// Interface for the AI Tread Analysis Response
export interface TreadAnalysisResult {
  estimatedDepthMm: number;
  wearPercentage: number;
  condition: string;
  recommendation: string;
}

/**
 * Helper to get the AI instance. 
 * Note: Use process.env.API_KEY which is standard.
 */
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

/**
 * Analyzes tire image using Gemini.
 */
export const analyzeTireImage = async (base64Image: string): Promise<TreadAnalysisResult> => {
  const ai = getAI();
  
  if (!ai) {
    return {
      estimatedDepthMm: 4.5,
      wearPercentage: 70,
      condition: "Modo de Demonstração",
      recommendation: "Configure a API Key para análise real."
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: `Analise o sulco deste pneu de caminhão. Retorne um JSON com:
            - estimatedDepthMm (número)
            - wearPercentage (número 0-100)
            - condition (string curta pt-BR)
            - recommendation (string curta pt-BR)`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                estimatedDepthMm: { type: Type.NUMBER },
                wearPercentage: { type: Type.NUMBER },
                condition: { type: Type.STRING },
                recommendation: { type: Type.STRING }
            }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Analysis error:", error);
    throw error;
  }
};

/**
 * Gets smart advice for the truck driver.
 */
export const getSmartAdvisorResponse = async (userQuery: string, truckContext: string): Promise<string> => {
    const ai = getAI();
    if (!ai) return "A IA está em modo offline. Verifique sua conexão ou chave de API.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Contexto: ${truckContext}. Pergunta: ${userQuery}`,
            config: {
                systemInstruction: "Você é o consultor RODDAR IA. Responda de forma curta e prática para caminhoneiros brasileiros."
            }
        });

        return response.text || "Sem resposta no momento.";
    } catch (error) {
        return "Erro ao consultar a base de conhecimento.";
    }
}

/**
 * Calculates road distance between cities.
 */
export const getDistanceBetweenCities = async (origin: string, destination: string): Promise<number> => {
    const ai = getAI();
    if (!ai) return 500;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Distância KM entre ${origin} e ${destination}. JSON: {"distanceKm": number}`,
            config: { responseMimeType: "application/json" }
        });

        const data = JSON.parse(response.text || '{}');
        return data.distanceKm || 0;
    } catch (error) {
        return 0;
    }
}