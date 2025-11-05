import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const generateRecommendations = async (
  viewedProducts: any[],
  cartProducts: any[],
  allProducts: any[]
) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `You are a product recommendation expert. Analyze user behavior and suggest the top 3-5 products they'd be most interested in.

Viewed products: ${viewedProducts.map(p => `${p.name} (${p.category}): ${p.description}`).join('; ') || 'None'}

Cart products: ${cartProducts.map(p => `${p.name} (${p.category}): ${p.description}`).join('; ') || 'None'}

Available product catalog:
${allProducts.map(p => `ID: ${p.id}, Name: ${p.name}, Category: ${p.category}, Description: ${p.description}, Tags: ${p.tags.join(', ')}`).join('\n')}

Respond ONLY with a valid JSON object in this exact format (no markdown, no code blocks):
{
  "recommendations": [
    {
      "product_id": "uuid",
      "reason": "explanation",
      "score": 0.95
    }
  ]
}`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  
  // Clean up the response
  let jsonText = text.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
  }
  
  try {
    const parsed = JSON.parse(jsonText);
    return parsed.recommendations;
  } catch (e) {
    console.error('Failed to parse AI response:', e, jsonText);
    return allProducts.slice(0, 3).map(p => ({
      product_id: p.id,
      reason: `Based on your browsing history, we think you'll love ${p.name}. ${p.description}`,
      score: 0.8
    }));
  }
};
