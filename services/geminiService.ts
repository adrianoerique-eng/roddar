import { GoogleGenAI, Type } from "@google/genai";

// Interface for the AI Tread Analysis Response
export interface TreadAnalysisResult {
  estimatedDepthMm: number;
  wearPercentage: number;
  condition: string;
  recommendation: string;
}

/**
 * Safely initializes GoogleGenAI only if key is present
 */
const getAIInstance = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined" || apiKey.length < 5) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Analyzes tire image using Gemini.
 */
export const analyzeTireImage = async (base64Image: string): Promise<TreadAnalysisResult> => {
  const ai = getAIInstance();
  
  if (!ai) {
    console.warn("RODDAR: API Key ausente. Usando análise simulada (Demo).");
    return new Promise(resolve => setTimeout(() => resolve({
      estimatedDepthMm: 4.8,
      wearPercentage: 72,
      condition: "Meia Vida / Alerta",
      recommendation: "Pneu em estado regular. Recomenda-se rodízio e nova aferição em 5.000km."
    }), 1500));
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
            text: `Você é um especialista técnico em pneus de caminhão (truck tire expert). 
            Analise esta imagem do sulco do pneu. 
            Retorne um JSON com:
            - estimatedDepthMm: estimativa em milimetros (apenas numero)
            - wearPercentage: porcentagem de desgaste (0 a 100)
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
 */
export const getSmartAdvisorResponse = async (userQuery: string, truckContext: string): Promise<string> => {
    const ai = getAIInstance();
    
    if (!ai) {
        return "Modo de Demonstração: Para obter respostas reais da IA RODDAR, configure sua API Key. Como dica geral: mantenha sempre a calibragem em dia para economizar até 5% de diesel.";
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Contexto do Caminhão: ${truckContext}
            Pergunta do usuário: ${userQuery}`,
            config: {
                systemInstruction: "Você é o RODDAR AI, assistente de pneus para caminhoneiros. Seja direto, prático e use termos das estradas brasileiras. Foco em economia e segurança."
            }
        });

        return response.text || "Não consegui processar sua dúvida no momento.";
    } catch (error) {
        console.error("Error in advisor:", error);
        return "Erro ao conectar com a central de inteligência RODDAR.";
    }
}

/**
 * Calculates road distance between cities.
 */
export const getDistanceBetweenCities = async (origin: string, destination: string): Promise<number> => {
    const ai = getAIInstance();
    
    if (!ai) {
        return Math.floor(Math.random() * 800) + 150;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Distância rodoviária aproximada (KM) entre ${origin} e ${destination}. JSON: {"distanceKm": number}`,
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

        const data = JSON.parse(response.text || '{}');
        return data.distanceKm || 0;
    } catch (error) {
        console.error("Error fetching distance:", error);
        return 0;
    }
}