exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const data = JSON.parse(event.body);

  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NOTION_KEY}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { database_id: process.env.NOTION_DATABASE_ID },
      properties: {
        Nome: { title: [{ text: { content: data.nome || "" } }] },
        Email: { email: data.email || "" },
        "Espaço Físico": {
          rich_text: [{ text: { content: data.espaco || "" } }],
        },
        Iluminação: {
          rich_text: [{ text: { content: data.iluminacao || "" } }],
        },
        Aroma: { rich_text: [{ text: { content: data.aroma || "" } }] },
        Jantar: { rich_text: [{ text: { content: data.jantar || "" } }] },
        "Adjetivos Negativos": {
          rich_text: [{ text: { content: data.adjetivos || "" } }],
        },
        "Sensação no Site": {
          rich_text: [{ text: { content: data.sensacao || "" } }],
        },
        "O Que Lembrar": {
          rich_text: [{ text: { content: data.lembrar || "" } }],
        },
        "Tendência a Evitar": {
          rich_text: [{ text: { content: data.tendencia || "" } }],
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return { statusCode: 500, body: error };
  }

  return { statusCode: 200, body: "OK" };
};
