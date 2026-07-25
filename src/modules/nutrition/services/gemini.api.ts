export interface CalorieEstimation {
  comida: string;
  calorias: number;
}

export async function estimarCalorias(imageBase64: string, mimeType: string): Promise<CalorieEstimation> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('No se encontro la API Key de Gemini. Verifica tu archivo .env');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

  const prompt = `Analiza esta imagen de comida. 
Responde ÚNICAMENTE con un JSON en este formato exacto:
{
  "comida": "Nombre descriptivo y simple de la comida",
  "calorias": 500
}
No agregues comillas invertidas (\`\`\`) ni formato Markdown, solo el JSON puro. Estima las calorias de forma aproximada.`;

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: imageBase64,
            },
          },
        ],
      },
    ],
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Error de Gemini:', errorBody);
    throw new Error(`Error en la llamada a Gemini: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!textResponse) {
    throw new Error('La respuesta de Gemini no tiene el formato esperado.');
  }

  try {
    const parsed = JSON.parse(textResponse.trim().replace(/^```json/, '').replace(/```$/, ''));
    return {
      comida: parsed.comida || 'Comida desconocida',
      calorias: typeof parsed.calorias === 'number' ? parsed.calorias : 0,
    };
  } catch (error) {
    console.error('Fallo al parsear JSON de Gemini:', textResponse);
    throw new Error('Gemini no devolvio un formato JSON valido.');
  }
}
