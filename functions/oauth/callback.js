export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const params = url.searchParams;
  const code = params.get('code');
  const state = params.get('state');

  // Validar variables de entorno
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return errorResponse('OAuth environment variables not configured');
  }

  if (!code) {
    return errorResponse('Missing code parameter');
  }

  // Recuperar y validar state desde la cookie
  const cookies = request.headers.get('cookie') || '';
  const match = cookies.match(/(?:^|; )oauth_state=([^;]+)/);
  const savedState = match ? match[1] : null;

  if (!savedState || savedState !== state) {
    return errorResponse('Invalid state (CSRF validation failed)', 400);
  }

  // Intercambiar código por access_token con GitHub
  let accessToken = null;
  let error = null;
  
  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Fundepovul-OAuth-Handler'
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code: code,
        redirect_uri: `${url.origin}/oauth/callback`,
        state: state
      })
    });

    const tokenJson = await tokenRes.json();
    accessToken = tokenJson.access_token || null;
    error = tokenJson.error || null;

    if (!accessToken) {
      error = error || 'No token received from GitHub';
    }
  } catch (e) {
    error = 'Failed to exchange code for token: ' + (e.message || String(e));
  }

  // Respuesta HTML que comunica el token al opener
  const headers = new Headers();
  headers.append('Content-Type', 'text/html; charset=utf-8');
  headers.append('Set-Cookie', 'oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
  headers.append('Cache-Control', 'no-cache, no-store, must-revalidate');

  const safeToken = JSON.stringify(accessToken);
  const safeError = JSON.stringify(error);
  const html = `<!doctype html>
<meta charset="utf-8">
<title>OAuth Callback</title>
<body style="font-family: sans-serif; padding: 20px;">
  <h2>Autenticación</h2>
  <p id="status">Procesando...</p>
  <script>
    (function(){
      try {
        const token = ${safeToken};
        const error = ${safeError};
        const origin = window.location.origin;
        
        if (!token && !error) {
          throw new Error('No token or error information available');
        }
        
        // Enviar mensaje al window.opener (si existe)
        if (window.opener) {
          const message = token 
            ? { type: 'authorization', provider: 'github', token: token, status: 'success' }
            : { type: 'authorization', provider: 'github', error: error || 'unknown_error', status: 'error' };

          // Enviar objeto (nuevo formato)
          window.opener.postMessage(message, origin);

          // Enviar también formato legacy STRING que algunos frontends (o versiones antiguas)
          // esperan: 'authorization:provider:status:JSON'
          try {
            const legacyPayload = token ? JSON.stringify({ token: token }) : JSON.stringify({ error: error || 'unknown_error' });
            const legacyMessage = token
              ? 'authorization:github:success:' + legacyPayload
              : 'authorization:github:error:' + legacyPayload;
            window.opener.postMessage(legacyMessage, origin);
          } catch (e) {
            // ignore
          }

          window.opener.focus && window.opener.focus();

          // Intentar cerrar la ventana después de un pequeño delay
          setTimeout(() => { window.close(); }, 500);
        } else {
          // Fallback: mostrar el token en la página para copia manual
          if (token) {
            document.getElementById('status').innerHTML = 
              '<strong style="color: green;">✓ Autenticación exitosa.</strong><br>' +
              'Token guardado. Puedes cerrar esta ventana.';
          } else {
            document.getElementById('status').innerHTML = 
              '<strong style="color: red;">✗ Error de autenticación:</strong><br>' +
              '<code>' + (error || 'Unknown error') + '</code><br>' +
              'Por favor, intenta de nuevo.';
          }
        }
      } catch (e) {
        document.getElementById('status').innerHTML = 
          '<strong style="color: red;">✗ Error durante el procesamiento:</strong><br>' +
          '<code>' + e.message + '</code>';
        console.error('OAuth callback error:', e);
      }
    })();
  </script>
</body>`;

  return new Response(html, { status: 200, headers });
}

// Helper function para devolver errores
function errorResponse(message, status = 500) {
  const html = `<!doctype html>
<meta charset="utf-8">
<body style="font-family: sans-serif; padding: 20px;">
  <h2>Error de Autenticación</h2>
  <p style="color: red;"><strong>✗ ${message}</strong></p>
  <p><a href="javascript:window.history.back()">Volver</a></p>
</body>`;
  return new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
