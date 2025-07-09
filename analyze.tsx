// analyze.js
import { OpenAI } from 'openai';
import fs from 'fs';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const filePath = process.argv[2];
const code = fs.readFileSync(filePath, 'utf-8');

const prompt = `
You are a senior developer. Please review the following code for:
1. Bugs
2. Code quality issues
3. Accessibility problems (if applicable)

Code:
\`\`\`js
${code}
\`\`\`
`;

const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: prompt }],
  temperature: 0.3,
});

console.log(response.choices[0].message.content);
