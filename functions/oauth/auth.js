export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const origin = url.origin;

  const clientId = env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return new Response(JSON.stringify({ error: 'GITHUB_CLIENT_ID not configured' }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  // Parsear parámetros que Decap envía
  const provider = url.searchParams.get('provider') || 'github';
  const scope = url.searchParams.get('scope') || 'repo';
  
  // Generar state aleatorio (CSRF protection)
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const state = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');

  // redirect_uri debe apuntar a /functions/oauth/callback
  const redirectUri = `${origin}/functions/oauth/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scope,
    state: state,
    allow_signup: 'false'
  });

  const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

  // Guardar state en cookie para validación posterior
  const headers = new Headers();
  headers.append('Content-Type', 'text/html; charset=utf-8');
  headers.append('Set-Cookie', `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  headers.append('Cache-Control', 'no-cache, no-store, must-revalidate');

  // Escapar comillas en la URL para seguridad
  const encodedUrl = authUrl.replace(/"/g, '&quot;');
  const html = `<!doctype html>
<meta charset="utf-8">
<title>Redirigiendo a GitHub...</title>
<body style="background: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
  <div style="text-align: center;">
    <h2>Redirigiendo a GitHub...</h2>
    <p>Por favor espera...</p>
  </div>
  <script>
    // Redirigir inmediatamente
    window.location.href = "${encodedUrl}";
  </script>
  <noscript>
    <meta http-equiv="refresh" content="0;url=${encodedUrl}" />
    <p><a href="${encodedUrl}">Haz clic aquí para continuar</a></p>
  </noscript>
</body>`;

  return new Response(html, { status: 200, headers });
}
