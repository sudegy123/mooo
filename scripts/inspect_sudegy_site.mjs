async function check(path) {
  const url = path.startsWith('http') ? path : `https://sudegy.com/${path.replace(/^\//, '')}`;
  try {
    const res = await fetch(url);
    const html = await res.text();
    const title = html.match(/<title>(.*?)<\/title>/i)?.[1] || '';
    const h1 = html.match(/<h1[^>]*>(.*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, '').trim() || '';
    console.log(`\n=== ${url} ===`);
    console.log('TITLE:', title);
    console.log('H1:', h1);
    const desc = html.match(/meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1] || '';
    console.log('DESC:', desc);
    // Find interesting text snippets or sections
    const text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                     .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                     .replace(/<[^>]+>/g, ' ')
                     .replace(/\s+/g, ' ')
                     .slice(0, 1000);
    console.log('PREVIEW:', text.slice(0, 300));
  } catch (e) {
    console.error(`ERR ${url}:`, e.message);
  }
}

async function main() {
  await check('/services');
  await check('/showrooms/');
  await check('/apex/');
  await check('/casual/');
  await check('/sneakers/');
  await check('/dental/');
}
main();
