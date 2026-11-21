async function main() {
  const res = await fetch('https://sudegy.com/showrooms/');
  const html = await res.text();
  console.log(html);
}
main();

