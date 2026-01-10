# OAuth GitHub con Cloudflare Pages Functions

Resumen rápido
- Añadí dos Cloudflare Pages Functions en `/functions/oauth` para gestionar OAuth con GitHub:
  - `/functions/oauth/auth` — inicia el flujo (genera `state`, guarda cookie y redirige a GitHub).
  - `/functions/oauth/callback` — intercambia `code` por `access_token` y envía el token al `window.opener`.
- Actualicé `admin/config.yml` y `_site/admin/config.yml` para usar `base_url: /functions/oauth`.

Variables de entorno (Cloudflare Pages)
- `GITHUB_CLIENT_ID` — configurada en Pages
- `GITHUB_CLIENT_SECRET` — configurada en Pages

Despliegue
1. Commit y push a la rama `main`.
2. Cloudflare Pages desplegará el sitio y publicará las Functions en tu dominio Pages:
   - `https://<tu-sitio>.pages.dev/functions/oauth/auth`
   - `https://<tu-sitio>.pages.dev/functions/oauth/callback`

Prueba rápida
1. Asegúrate de que las env vars estén en el panel de Pages.
2. Abre el admin (`/admin`) e inicia login con GitHub.
3. Autoriza la app en GitHub; la ventana emergente debe enviar el token al padre y cerrarse.
4. Verifica en la consola del navegador. Hay un listener de debug en `admin/index.html` que registra los mensajes `postMessage`.

Formatos de mensaje enviados por la callback
- `{ type: 'authorization_response', provider: 'github', token: '<token>' }`
- `{ type: 'decap-oauth', provider: 'github', token: '<token>', status: 'success' }`

Troubleshooting
- Cookies: las cookies se marcan `Secure` y `HttpOnly`; Pages usa HTTPS en producción.
- Si el popup no se cierra, revisa la consola del popup y de la página principal para mensajes `postMessage`.
- Si Decap no acepta el token automáticamente, dime la estructura exacta que necesita y adapto el payload.

Cambios en el repo (archivos clave)
- `functions/oauth/auth.js` (nuevo)
- `functions/oauth/callback.js` (nuevo)
- `admin/config.yml` (modificado)
- `_site/admin/config.yml` (modificado)
- `admin/index.html` (modificado: listener de debug)

Comandos útiles
```bash
# Añadir, commitear y pushear
git add .
git commit -m "Agregar OAuth GitHub via Pages Functions"
git push origin main
```

Si quieres, puedo añadir un pequeño test harness o adaptar el formato del mensaje para que lo consuma exactamente Decap CMS.
