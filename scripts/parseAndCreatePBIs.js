const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { Octokit } = require("@octokit/rest");

// -----------------------------
// GitHub Setup
// -----------------------------
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

// -----------------------------
// Config
// -----------------------------
const PBI_DIR = "pbis";
const DEFAULT_LABELS = ["PBI"];

// -----------------------------
// Helpers
// -----------------------------
function safeReadFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (err) {
    console.error(`Failed to read file: ${filePath}`, err.message);
    return null;
  }
}

function getChangedMarkdownFiles() {
  try {
    const output = execSync("git diff --name-only HEAD^ HEAD", { encoding: "utf8" })
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const changed = output.filter(
      (file) => file.startsWith(`${PBI_DIR}/`) && file.endsWith(".md")
    );

    if (changed.length > 0) return changed;
  } catch (err) {
    console.warn("Could not diff HEAD^ HEAD. Falling back to scanning all pbis/*.md");
  }

  if (!fs.existsSync(PBI_DIR)) return [];

  return fs
    .readdirSync(PBI_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => path.join(PBI_DIR, file));
}

function extractFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) return {};

  const obj = {};
  const lines = match[1].split("\n");

  for (const line of lines) {
    const kv = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.+)$/);
    if (kv) {
      obj[kv[1].trim().toLowerCase()] = kv[2].trim();
    }
  }

  return obj;
}

function stripFrontmatter(content) {
  return content.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, "");
}

function detectSprint(filePath, content) {
  const frontmatter = extractFrontmatter(content);

  if (frontmatter.sprint) {
    const sprintNum = String(frontmatter.sprint).match(/\d+/);
    if (sprintNum) return sprintNum[0];
  }

  const contentMatch = content.match(/\bSprint\s*#?\s*(\d+)\b/i);
  if (contentMatch) return contentMatch[1];

  const fileName = path.basename(filePath);
  const fileMatch = fileName.match(/sprint[-_\s]?(\d+)/i);
  if (fileMatch) return fileMatch[1];

  return null;
}

function normalizeTitle(title) {
  return title
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[-:#\s]+/, "")
    .replace(/[.:;\s]+$/, "");
}

function splitPbis(content) {
  const clean = stripFrontmatter(content).replace(/\r\n/g, "\n");

  // Preferred split: "## PBI 1: Title" or "### PBI 1 - Title"
  const headingRegex = /^(##+)\s*PBI\s*(\d+)\s*[:\-]?\s*(.+)$/gim;
  const matches = [...clean.matchAll(headingRegex)];

  if (matches.length > 0) {
    const pbis = [];

    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index;
      const end = i + 1 < matches.length ? matches[i + 1].index : clean.length;
      const rawBlock = clean.slice(start, end).trim();

      const title = normalizeTitle(`PBI ${matches[i][2]}: ${matches[i][3]}`);
      pbis.push({ title, body: rawBlock });
    }

    return pbis;
  }

  // Fallback split: horizontal rule sections
  const hrSections = clean
    .split(/\n-{3,}\n|\n\*{3,}\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const pbiLikeSections = hrSections
    .map((section) => {
      const firstLine = section.split("\n")[0]?.trim() || "";
      if (/PBI\s*\d+/i.test(firstLine)) {
        return {
          title: normalizeTitle(firstLine),
          body: section,
        };
      }
      return null;
    })
    .filter(Boolean);

  return pbiLikeSections;
}

async function ensureLabelExists(labelName, color = "1D76DB", description = "") {
  try {
    await octokit.issues.getLabel({
      owner,
      repo,
      name: labelName,
    });
    console.log(`Label already exists: ${labelName}`);
  } catch (err) {
    if (err.status === 404) {
      await octokit.issues.createLabel({
        owner,
        repo,
        name: labelName,
        color,
        description: description || undefined,
      });
      console.log(`Created label: ${labelName}`);
    } else {
      throw err;
    }
  }
}

async function findExistingIssueByTitle(title) {
  const query = `repo:${owner}/${repo} is:issue in:title "${title}"`;
  const result = await octokit.search.issuesAndPullRequests({
    q: query,
    per_page: 10,
  });

  return result.data.items.find(
    (item) => item.title.trim().toLowerCase() === title.trim().toLowerCase()
  );
}

async function createIssueWithLabels(title, body, labels) {
  const existing = await findExistingIssueByTitle(title);

  if (existing) {
    console.log(`Issue already exists, skipping: ${title} (#${existing.number})`);
    return existing;
  }

  const created = await octokit.issues.create({
    owner,
    repo,
    title,
    body,
    labels,
  });

  console.log(`Created issue: ${title} (#${created.data.number})`);
  return created.data;
}

// -----------------------------
// Main
// -----------------------------
async function main() {
  const files = getChangedMarkdownFiles();

  if (files.length === 0) {
    console.log("No changed markdown files found in /pbis");
    return;
  }

  for (const file of files) {
    console.log(`\nProcessing file: ${file}`);
    const content = safeReadFile(file);

    if (!content) continue;

    const sprint = detectSprint(file, content);
    const sprintLabel = sprint ? `Sprint ${sprint}` : null;

    // Ensure labels exist before creating issues
    for (const label of DEFAULT_LABELS) {
      await ensureLabelExists(label, "5319E7", "Product Backlog Item");
    }

    if (sprintLabel) {
      await ensureLabelExists(
        sprintLabel,
        "0E8A16",
        `Issues associated with ${sprintLabel}`
      );
    } else {
      console.warn(`No sprint detected for ${file}. Issues will only get default labels.`);
    }

    const pbis = splitPbis(content);

    if (pbis.length === 0) {
      console.warn(`No PBIs detected in ${file}`);
      continue;
    }

    for (const pbi of pbis) {
      const labels = [...DEFAULT_LABELS];
      if (sprintLabel) labels.push(sprintLabel);

      await createIssueWithLabels(pbi.title, pbi.body, labels);
    }
  }
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
