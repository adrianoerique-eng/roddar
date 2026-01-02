import { GoogleGenAI, Type } from "@google/genai";

// Fix: obtain apiKey exclusively from process.env.API_KEY and use direct initialization with named parameter.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Interface for the AI Tread Analysis Response
export interface TreadAnalysisResult {
  estimatedDepthMm: number;
  wearPercentage: number;
  condition: string;
  recommendation: string;
}

/**
 * Analyzes tire image using Gemini.
 * Fix: Use 'gemini-3-flash-preview' for vision-based text analysis.
 */
export const analyzeTireImage = async (base64Image: string): Promise<TreadAnalysisResult> => {
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
            text: `Você é um especialista técnico em pneus de caminhão (truck tire expert). 
            Analise esta imagem do sulco do pneu. Se houver uma moeda ou indicador TWI, use como referência.
            
            Retorne um JSON com:
            - estimatedDepthMm: estimativa em milimetros (apenas numero)
            - wearPercentage: porcentagem de desgaste (0 a 100, onde 100 é careca)
            - condition: resumo curto em pt-BR (ex: "Novo", "Meia Vida", "Perigoso")
            - recommendation: sugestão técnica curta em pt-BR.`
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

    // Fix: Use .text property instead of .text() method
    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as TreadAnalysisResult;
  } catch (error) {
    console.error("Error analyzing tire:", error);
    throw error;
  }
};

/**
 * Gets smart advice for the truck driver.
 * Fix: Use 'gemini-3-flash-preview' for basic text tasks.
 */
export const getSmartAdvisorResponse = async (userQuery: string, truckContext: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Contexto do Caminhão: ${truckContext}
            
            Você é o RODDAR AI, um assistente especializado em gestão de pneus para caminhoneiros brasileiros. 
            Seu tom é profissional, direto e parceiro ("estradeiro").
            Foco: Economia (CPK), Segurança e Durabilidade.
            
            Pergunta do usuário: ${userQuery}`,
            config: {
                systemInstruction: "Você é um assistente útil para caminhoneiros. Responda de forma concisa e prática."
            }
        });

        // Fix: Use .text property
        return response.text || "Desculpe, não consegui processar sua dúvida agora.";
    } catch (error) {
        console.error("Error in advisor:", error);
        return "Erro ao conectar com a central de inteligência RODDAR.";
    }
}

/**
 * Calculates road distance between cities.
 * Fix: Use 'gemini-3-flash-preview'.
 */
export const getDistanceBetweenCities = async (origin: string, destination: string): Promise<number> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Calcule a distância rodoviária aproximada em quilômetros (KM) para caminhões entre ${origin} e ${destination}.
            Considere as principais rodovias brasileiras.
            Retorne APENAS um objeto JSON com o campo 'distanceKm' (número inteiro). Exemplo: {"distanceKm": 450}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        distanceKm: { type: Type.NUMBER }
                    }
                }
            }
        });

        // Fix: Use .text property
        const data = JSON.parse(response.text || '{}');
        return data.distanceKm || 0;
    } catch (error) {
        console.error("Error fetching distance:", error);
        return 0;
    }
}