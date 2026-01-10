export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  
  if (!code) return new Response("Error: Sin código", { status: 400 });

  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "accept": "application/json",
        "user-agent": "fundepovul-oauth",
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const result = await response.json();
    if (result.error) return new Response(JSON.stringify(result), { status: 401 });

    const token = result.access_token;
    const provider = "github";

    // HTML QUE SE EJECUTA EN EL MISMO DOMINIO (¡NO MÁS BLOQUEOS!)
    const html = `
      <!DOCTYPE html>
      <html>
      <body>
      <script>
        const msg = 'authorization:${provider}:success:${JSON.stringify({ token: token })}';
        
        // Al estar en el mismo dominio, esto funciona instantáneo
        window.opener.postMessage(msg, window.location.origin);
        window.close();
      </script>
      </body>
      </html>
    `;

    return new Response(html, {
      headers: { "content-type": "text/html;charset=UTF-8" },
    });

  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}
