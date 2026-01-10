export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const params = url.searchParams;
  const code = params.get('code');
  const state = params.get('state');

  const cookies = request.headers.get('cookie') || '';
  const match = cookies.match(/(?:^|; )oauth_state=([^;]+)/);
  const savedState = match ? match[1] : null;

  if (!code) {
    return new Response('Missing code', { status: 400 });
  }

  // verificar state
  if (!savedState || savedState !== state) {
    const html = `<!doctype html><meta charset="utf-8"><script>const origin = window.location.origin; if(window.opener){window.opener.postMessage({type:'decap-oauth', error:'invalid_state'}, origin); window.close();} else {document.body.innerText='Estado inválido.'}</script>`;
    return new Response(html, { headers: { 'Content-Type': 'text/html' } });
  }

  // intercambiar código por token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code: code,
      redirect_uri: `${url.origin}/functions/oauth/callback`,
      state: state
    })
  });

  const tokenJson = await tokenRes.json();
  const accessToken = tokenJson.access_token || null;

  // eliminar cookie state
  const headers = { 'Content-Type': 'text/html' };
  headers['Set-Cookie'] = 'oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';

  // Respuesta HTML que comunica el token al opener usando window.location.origin
  const safeToken = JSON.stringify(accessToken);
  const html = `<!doctype html>
<meta charset="utf-8">
<title>Autenticación completada</title>
<script>
  (function(){
    try {
      const token = ${safeToken};
      const origin = window.location.origin;
      if (window.opener) {
        if (token) {
          // Enviar dos formatos para máxima compatibilidad con distintos frontends
          window.opener.postMessage({type:'authorization_response', provider: 'github', token: token}, origin);
          window.opener.postMessage({type:'decap-oauth', provider: 'github', token: token, status: 'success'}, origin);
        } else {
          window.opener.postMessage({type:'authorization_response', provider: 'github', error: 'no_token'}, origin);
          window.opener.postMessage({type:'decap-oauth', provider: 'github', error: 'no_token'}, origin);
        }
        window.opener.focus && window.opener.focus();
        window.close();
      } else {
        document.body.innerText = token ? 'Autenticación completa. Puedes cerrar esta ventana.' : 'Error al obtener token.';
      }
    } catch (e) {
      document.body.innerText = 'Error durante OAuth.';
    }
  })();
</script>`;

  return new Response(html, { status: 200, headers });
}
