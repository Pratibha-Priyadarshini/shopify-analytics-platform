import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface BusinessData {
  revenue: {
    total: number;
    trend: number;
    daily: Array<{ date: string; amount: number }>;
  };
  orders: {
    total: number;
    pending: number;
    processing: number;
    fulfilled: number;
  };
  customers: {
    total: number;
    active: number;
    vip: number;
    churnRisk: number;
  };
  products: {
    total: number;
    lowStock: number;
    outOfStock: number;
    topSellers: Array<{ name: string; sold: number; revenue: number }>;
  };
}

export async function generateBusinessInsights(data: BusinessData) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a business analytics AI assistant. Analyze the following e-commerce business data and provide actionable insights.

Business Data:
- Total Revenue: $${data.revenue.total.toFixed(2)} (${data.revenue.trend >= 0 ? '+' : ''}${data.revenue.trend.toFixed(1)}% trend)
- Total Orders: ${data.orders.total} (Pending: ${data.orders.pending}, Processing: ${data.orders.processing}, Fulfilled: ${data.orders.fulfilled})
- Customers: ${data.customers.total} total (Active: ${data.customers.active}, VIP: ${data.customers.vip}, At Risk: ${data.customers.churnRisk})
- Products: ${data.products.total} total (Low Stock: ${data.products.lowStock}, Out of Stock: ${data.products.outOfStock})
- Top Products: ${data.products.topSellers.map(p => `${p.name} (${p.sold} sold, $${p.revenue})`).join(', ')}

Provide a JSON response with the following structure:
{
  "predictions": [
    {
      "title": "Brief prediction title",
      "description": "Detailed prediction based on data",
      "confidence": 75-95,
      "impact": "critical|high|medium|low",
      "icon": "relevant emoji"
    }
  ],
  "trends": [
    {
      "metric": "Metric name",
      "current": "Current value (just the number/percentage, no labels)",
      "change": "Percentage change (e.g., +12.5% or -8.3%)",
      "trend": "up|down",
      "description": "Brief explanation (max 100 characters)"
    }
  ],
  "recommendations": [
    {
      "title": "Action title",
      "description": "Detailed recommendation",
      "priority": "critical|high|medium|low",
      "estimatedImpact": "Expected outcome"
    }
  ]
}

IMPORTANT RULES:
- Do NOT include "N/A" anywhere in the response
- Keep "current" values clean (just numbers/percentages, no extra labels)
- Keep descriptions concise and under 100 characters
- Use actual data values, not placeholders
- Be specific and data-driven

Focus on:
1. Revenue forecasting based on trends
2. Inventory management alerts
3. Customer retention strategies
4. Sales optimization opportunities

Provide 3-4 predictions, 4 trends, and 3-4 recommendations.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = text;
    if (text.includes("```json")) {
      jsonText = text.split("```json")[1].split("```")[0].trim();
    } else if (text.includes("```")) {
      jsonText = text.split("```")[1].split("```")[0].trim();
    }
    
    const insights = JSON.parse(jsonText);
    return insights;
  } catch (error) {
    console.error("Error generating insights with Gemini:", error);
    throw error;
  }
}

export async function generatePerformanceAnalysis(data: BusinessData) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Analyze this e-commerce business performance data and identify top performers and items needing attention.

Data:
- Revenue: $${data.revenue.total} (${data.revenue.trend >= 0 ? '+' : ''}${data.revenue.trend}% trend)
- Orders: ${data.orders.total}
- Products: ${data.products.total} (${data.products.lowStock} low stock, ${data.products.outOfStock} out of stock)
- Top Sellers: ${data.products.topSellers.map(p => `${p.name} ($${p.revenue})`).join(', ')}

Provide JSON:
{
  "topPerformers": [
    {"name": "Item name", "metric": "Value (clean number)", "label": "Metric type"}
  ],
  "underperformers": [
    {"name": "Item name", "metric": "Value (clean number)", "label": "Issue type"}
  ]
}

IMPORTANT: Do NOT include "N/A" anywhere. Use actual data values only.
Identify 3 top performers and 3 items needing attention based on the data.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    let jsonText = text;
    if (text.includes("```json")) {
      jsonText = text.split("```json")[1].split("```")[0].trim();
    } else if (text.includes("```")) {
      jsonText = text.split("```")[1].split("```")[0].trim();
    }
    
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error generating performance analysis:", error);
    throw error;
  }
}

export async function generateMarketIntelligence(data: BusinessData) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Based on this e-commerce business data, provide market intelligence insights:

Revenue: $${data.revenue.total} (${data.revenue.trend >= 0 ? '+' : ''}${data.revenue.trend}% trend)
Orders: ${data.orders.total}
Customers: ${data.customers.total}

Provide JSON:
{
  "industryGrowth": "+XX.X%",
  "competitivePosition": "Top XX%",
  "marketOpportunity": "$XX,XXX",
  "insights": "Brief market analysis"
}

IMPORTANT: Do NOT include "N/A" anywhere. Provide realistic estimates based on the business size and growth rate.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    let jsonText = text;
    if (text.includes("```json")) {
      jsonText = text.split("```json")[1].split("```")[0].trim();
    } else if (text.includes("```")) {
      jsonText = text.split("```")[1].split("```")[0].trim();
    }
    
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error generating market intelligence:", error);
    throw error;
  }
}
