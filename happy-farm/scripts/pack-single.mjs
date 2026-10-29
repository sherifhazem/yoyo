// Builds dist-single and writes ONE html fragment (title, style, markup, module script) for hosting as a page.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

execSync('npx vite build --config vite.single.config.js', { stdio: 'inherit' });
const dir = 'dist-single/assets/';
const files = readdirSync(dir);
const js = readFileSync(dir + files.find((f) => f.endsWith('.js')), 'utf8').replace(/<\/script/gi, '<\\/script');
const css = readFileSync(dir + files.find((f) => f.endsWith('.css')), 'utf8');
const html = readFileSync('index.html', 'utf8');
const body = html.slice(html.indexOf('<body>') + 6, html.indexOf('<script type="module"')).trim();
const fonts = '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap">';
const out = `<title>Happy Farm</title>\n${fonts}\n<style>${css}</style>\n${body}\n<script type="module">${js}</script>\n`;
writeFileSync(process.argv[2] || 'dist-single/happy-farm.html', out);
console.log('wrote', (out.length / 1024).toFixed(0) + ' KB');
