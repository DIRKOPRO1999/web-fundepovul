export async function onRequest(context) {
  const { env } = context;
  const client_id = env.GITHUB_CLIENT_ID;
  
  // Scopes correctos para Decap CMS
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo,user`;
  
  return Response.redirect(redirectUrl, 302);
}
