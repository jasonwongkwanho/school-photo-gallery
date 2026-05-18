exports.handler = async function (event, context) {
  const gasUrl = process.env.GAS_WEBAPP_URL;
  const apiSecret = process.env.GAS_API_SECRET;

  if (!gasUrl || !apiSecret) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        ok: false,
        error: "Missing GAS_WEBAPP_URL or GAS_API_SECRET"
      })
    };
  }

  const url =
    gasUrl +
    "?action=list&token=" +
    encodeURIComponent(apiSecret);

  try {
    const response = await fetch(url);
    const text = await response.text();

    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=60"
      },
      body: text
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        ok: false,
        error: error.message
      })
    };
  }
};
