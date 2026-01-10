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

  // Guardar state en cookie para validación posterior
  const headers = new Headers();
  headers.set('Location', authUrl);
  // cookie segura, duración breve
  headers.append('Set-Cookie', `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);

  return new Response(null, { status: 302, headers });
}
