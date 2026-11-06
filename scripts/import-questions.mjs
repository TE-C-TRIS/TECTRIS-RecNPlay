import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';

const cString = String.raw`"(?:\\.|[^"\\])*"`;
const answerList = String.raw`(?:${cString}|[^}])*`;
const normalSource = readFileSync(new URL('../src/game/questions.c', import.meta.url), 'utf8');
const normalPattern = new RegExp(String.raw`\{\s*(${cString})\s*,\s*\{(${answerList})\}\s*,\s*(\d+)\s*,\s*(\d+)\s*\}`, 'gs');
const normal = [...normalSource.matchAll(normalPattern)].map(match => {
  const question = JSON.parse(match[1]);
  const answers = [...match[2].matchAll(new RegExp(cString, 'g'))].map(answer => JSON.parse(answer[0]));
  return { question, answers, level: Number(match[4]) };
});
const easySource = readFileSync(new URL('../src/game/questions_modo_easy.c', import.meta.url), 'utf8');
const easyPattern = new RegExp(String.raw`\{\s*(${cString})\s*,\s*\{(${answerList})\}\s*,\s*(\d+)\s*\}`, 'gs');
const easy = [...easySource.matchAll(easyPattern)].map(match => ({
  question: JSON.parse(match[1]),
  answers: [...match[2].matchAll(new RegExp(cString, 'g'))].map(answer => JSON.parse(answer[0])),
  correct: Number(match[3]),
}));
if (normal.length < 90 || easy.length < 90) throw new Error(`Extração incompleta: C=${normal.length}, Easy=${easy.length}`);
const out = new URL('../frontend/src/data/', import.meta.url);
mkdirSync(out, { recursive: true });
writeFileSync(new URL('questions.json', out), JSON.stringify(normal, null, 2));
writeFileSync(new URL('questions-easy.json', out), JSON.stringify(easy, null, 2));
process.stdout.write(`Banco migrado: ${normal.length} perguntas de C e ${easy.length} perguntas Easy.\n`);
