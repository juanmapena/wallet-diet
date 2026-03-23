const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { messages, contextData } = JSON.parse(event.body);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: "API Key maestra no configurada en Netlify." }) 
      };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `
        Eres un "Wallet Coach" experto en finanzas personales, irónico, amable, directo y estructurado como "Tricount" y otras apps modernas.
        Tienes que responder a la pregunta del usuario basándote EXCLUSIVAMENTE en este contexto de su mes actual:
        - Ingresos mensuales: $${contextData.monthlyIncome}
        - Gastos totales hasta ahora: $${contextData.totalExp}
        - Saldo disponible: $${contextData.balance}
        - Gastos por categoría: ${contextData.categoriesStr || 'ninguno todavía'}
        ${contextData.dolarBlueRate ? `- Cotización Dólar Blue actual: $${contextData.dolarBlueRate}` : ''}
        
        Reglas:
        1. Sé conciso pero con un toque humano/gracioso. Usa emojis.
        2. Si pregunta si puede comprar algo, evalúa matemáticamente (resta el valor al saldo) y dile si va a estar "en ayuno estricto" o si se lo puede permitir.
        3. Habla en español de Argentina (vos, comprás, tenés).
      `
    });

    const formattedMessages = messages.filter(m => m.role !== 'system').map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    // Start chat with history (all except last message)
    const chat = model.startChat({
        history: formattedMessages.slice(0, -1)
    });

    // Send the last message
    const result = await chat.sendMessage(formattedMessages[formattedMessages.length - 1].parts[0].text);
    const textResponse = result.response.text();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response: textResponse }),
    };
  } catch (error) {
    console.error("Coach API Server Error:", error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: "Error en el servidor de IA. Intenta en un rato." }),
    };
  }
};
