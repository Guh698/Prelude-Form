exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const data = JSON.parse(event.body);

  const notionProperties = {
    Nome: { title: [{ text: { content: data.nome || "Sem Nome" } }] },
    Espaco: { rich_text: [{ text: { content: data.espaco || "" } }] },
    Iluminacao: { rich_text: [{ text: { content: data.iluminacao || "" } }] },
    Aroma: { rich_text: [{ text: { content: data.aroma || "" } }] },
    Jantar: { rich_text: [{ text: { content: data.aroma || "" } }] },
    Adjetivos: { rich_text: [{ text: { content: data.aroma || "" } }] },
    Sensacao: { rich_text: [{ text: { content: data.aroma || "" } }] },
    Memoria: { rich_text: [{ text: { content: data.aroma || "" } }] },
    Tendencia: { rich_text: [{ text: { content: data.aroma || "" } }] },
  };

  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NOTION_KEY}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { database_id: process.env.NOTION_DATABASE_ID },
      properties: notionProperties,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Notion Error:", error);
    return { statusCode: 500, body: error };
  }

  return { statusCode: 200, body: "OK" };
};
