const fs = require('fs');
const { execSync } = require('child_process');
const { Octokit } = require("@octokit/rest");

// -----------------------------
// GitHub Setup
// -----------------------------
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');

// -----------------------------
// Get Changed .md Files in /pbis/
// -----------------------------
function getChangedMarkdownFiles() {
  try {
    // Try to diff against previous commit
    const output = execSync("git diff --name-only HEAD^ HEAD")
      .toString()
      .split('\n');

    return output.filter(file =>
      file.startsWith('pbis/') && file.endsWith('.md')
    );

  } catch (err) {
    console.warn("Fallback: no previous commit, scanning all pbis/*.md");

    // Fallback: scan entire pbis folder
    return fs.readdirSync('pbis')
      .filter(file => file.endsWith('.md'))
      .map(file => `pbis/${file}`);
  }
}

// -----------------------------
// Parse PBIs from Markdown
// -----------------------------
function parsePBIs(content) {
  const blocks = content.split('### **Priority:').slice(1);

  return blocks.map(block => {
    const priorityMatch = block.match(/(High|Medium|Low)/);
    const priority = priorityMatch ? priorityMatch[1] : '';

    const userStoryMatch = block.match(/\*\*User Story:\*\*\s*([\s\S]*?)\n\n/);
    const user_story = userStoryMatch ? userStoryMatch[1].trim() : '';

    const acceptanceMatch = block.match(/\*\*Acceptance Criteria:\*\*\s*([\s\S]*?)(---|$)/);

    const acceptance_criteria = acceptanceMatch
      ? acceptanceMatch[1]
          .split('\n')
          .filter(line => line.trim().startsWith('*'))
          .map(line => line.replace('*', '').trim())
      : [];

    return {
      priority,
      user_story,
      acceptance_criteria
    };
  }).filter(pbi => pbi.user_story); // remove empty entries
}

// -----------------------------
// Format Issue Body (matches YAML template)
// -----------------------------
function formatToTemplate(pbi) {
  return `### pbi

**Priority:** ${pbi.priority}

**User Story:**
${pbi.user_story}

**Acceptance Criteria:**
${pbi.acceptance_criteria.map(c => `- ${c}`).join('\n')}
`;
}

// -----------------------------
// Get Existing Issues (for duplicate prevention)
// -----------------------------
async function getExistingIssues() {
  const issues = await octokit.issues.listForRepo({
    owner,
    repo,
    state: 'all',
    per_page: 100
  });

  return issues.data.map(issue => issue.title);
}

// -----------------------------
// Create Issues
// -----------------------------
async function createIssues(pbis) {
  const existingTitles = await getExistingIssues();

  for (const pbi of pbis) {
    const title = pbi.user_story.split('\n')[0].slice(0, 80);

    if (existingTitles.includes(title)) {
      console.log(`Skipping duplicate: ${title}`);
      continue;
    }

    try {
      await octokit.issues.create({
        owner,
        repo,
        title,
        body: formatToTemplate(pbi),
        labels: [
          "PBI",
          ...(pbi.priority ? [pbi.priority] : [])
        ]
      });

      console.log(`Created issue: ${title}`);
    } catch (err) {
      console.error(`Error creating issue: ${title}`, err);
    }
  }
}

// -----------------------------
// Main Execution
// -----------------------------
(async () => {
  const files = getChangedMarkdownFiles();

  if (files.length === 0) {
    console.log("No relevant .md files changed.");
    return;
  }

  for (const file of files) {
    console.log(`Processing file: ${file}`);

    const content = fs.readFileSync(file, 'utf-8');
    const pbis = parsePBIs(content);

    if (pbis.length === 0) {
      console.log(`No PBIs found in ${file}`);
      continue;
    }

    await createIssues(pbis);
  }
})();