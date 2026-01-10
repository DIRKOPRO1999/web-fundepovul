export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const origin = url.origin;

  const clientId = env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return new Response('GITHUB_CLIENT_ID no configurado', { status: 500 });
  }

  // generar state aleatorio
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const state = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');

  const redirectUri = `${origin}/functions/oauth/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'repo',
    state: state,
    allow_signup: 'false'
  });

  const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

  // Devolver una pequeña página que guarda la cookie y hace la redirección por cliente.
  // Esto evita que Pages renderice la página estática en el popup en lugar de redirigir.
  const headers = new Headers();
  headers.append('Content-Type', 'text/html; charset=utf-8');
  headers.append('Set-Cookie', `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);

  const safeAuthUrl = authUrl.replace(/</g, '%3C');
  const html = `<!doctype html><meta charset="utf-8"><title>Redirecting...</title><script>window.location.href = "${safeAuthUrl}";</script><noscript><meta http-equiv="refresh" content="0;url=${safeAuthUrl}" /></noscript>`;

  return new Response(html, { status: 200, headers });
}
