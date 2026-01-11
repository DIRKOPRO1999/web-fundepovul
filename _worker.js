export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/oauth/auth') {
      return handleAuth(request, env, url);
    } else if (url.pathname === '/oauth/callback') {
      return handleCallback(request, env, url);
    }

    // Para otras rutas, servir desde Pages
    return fetch(request);
  }
};

async function handleAuth(request, env, url) {
  const clientId = env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return new Response('GITHUB_CLIENT_ID not configured', { status: 500 });
  }

  const scope = url.searchParams.get('scope') || 'repo';
  const state = crypto.getRandomValues(new Uint8Array(16)).reduce((a, b) => a + b.toString(16).padStart(2, '0'), '');

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${url.origin}/oauth/callback&scope=${scope}&state=${state}`;

  // Guardar state en cookie
  const headers = new Headers();
  headers.append('Set-Cookie', `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  headers.append('Location', authUrl);

  return new Response(null, { status: 302, headers });
}

async function handleCallback(request, env, url) {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return new Response('OAuth env vars not configured', { status: 500 });
  }

  if (!code) {
    return new Response('Missing code', { status: 400 });
  }

  // Validar state
  const cookies = request.headers.get('cookie') || '';
  const stateMatch = cookies.match(/oauth_state=([^;]+)/);
  if (!stateMatch || stateMatch[1] !== state) {
    return new Response('Invalid state', { status: 400 });
  }

  // Intercambiar code por token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code: code
    })
  });

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  if (!accessToken) {
    return new Response('Failed to get token', { status: 500 });
  }

  // HTML con postMessage
  const html = `<!doctype html>
  <html>
  <head><title>OAuth Callback</title></head>
  <body>
    <script>
      window.opener.postMessage({
        type: 'authorization',
        provider: 'github',
        token: '${accessToken}'
      }, window.location.origin);
      setTimeout(() => window.close(), 500);
    </script>
  </body>
  </html>`;

  const headers = new Headers();
  headers.append('Content-Type', 'text/html');
  headers.append('Set-Cookie', 'oauth_state=; Path=/; Max-Age=0');

  return new Response(html, { headers });
}