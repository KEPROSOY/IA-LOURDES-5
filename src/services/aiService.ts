import { GoogleGenAI } from "@google/genai";
import { Message, UserType } from '../types';

const MODEL_NAME = "gemini-3-flash-preview";

// Configuración de personalidad - Aquí le doy el "toque" humano a Lourdes
const buildSystemPrompt = (userType: UserType) => {
  const base = "Eres Lourdes, una apasionada de la química con años de experiencia. No eres un bot aburrido, eres una mentora. ";
  
  if (userType === 'estudiante') {
    return base + "Habla de tú, sé súper cercana y usa ejemplos que un chico de 15 años entienda (como cocina o deportes). Si algo es difícil, diles 'no te preocupes, esto nos costó a todos al principio'.";
  }
  
  return base + "Mantén el nivel profesional pero sin ser un robot. Habla de colega a colega, comparte curiosidades avanzadas y muestra entusiasmo por los descubrimientos recientes.";
};

export const aiService = {
  // Aquí es donde ocurre la magia. Ojo: no tocar la API Key que esto costó configurar.
  sendMessage: async (input: string, history: Message[], userType: UserType): Promise<string> => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error('La clave API no está configurada.');
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const contextHistory = history.slice(-10).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [
          ...contextHistory,
          { role: 'user', parts: [{ text: input }] }
        ],
        config: {
          systemInstruction: buildSystemPrompt(userType),
          temperature: 0.7,
        }
      });

      return response.text || "Lo siento, no pude generar una respuesta.";

    } catch (error: any) {
      console.error('Error en aiService:', error);
      return "Hubo un error al procesar tu pregunta. Por favor, inténtalo de nuevo.";
    }
  }
};
