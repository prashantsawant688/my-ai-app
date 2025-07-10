import { OpenAI } from 'openai';
import { Octokit } from '@octokit/rest';
import { execSync } from 'child_process';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const repoInfo = process.env.GITHUB_REPOSITORY?.split('/');
if (!repoInfo || repoInfo.length < 2) {
  throw new Error(
    '❌ GITHUB_REPOSITORY environment variable is not set or malformed.',
  );
}

const [owner, repo] = repoInfo;
const prNumber = process.env.PR_NUMBER;

// Get diff
const diff = execSync('git diff origin/main').toString();

// Prompt
const prompt = `
You are a senior code reviewer. Analyze this PR diff for:
- bugs
- bad practices
- accessibility issues (if UI-related)
- security flaws

Respond in markdown format.

\`\`\`diff
${diff}
\`\`\`
`;

// Send to OpenAI
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: prompt }],
  temperature: 0.3,
});

const review = response.choices[0].message.content;

// Post comment to PR
await octokit.issues.createComment({
  owner,
  repo,
  issue_number: prNumber,
  body: `🤖 **AI Code Review by OpenAI**\n\n${review}`,
});

console.log('✅ Comment posted to PR #' + prNumber);
