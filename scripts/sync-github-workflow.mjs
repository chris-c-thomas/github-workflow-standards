#!/usr/bin/env node
/**
 * Sync a standard GitHub repository label taxonomy and optional GitHub Projects v2
 * single-select fields.
 *
 * Requirements:
 *   - Node.js 20+
 *   - GH_TOKEN or GITHUB_TOKEN in the environment, or GitHub CLI auth locally
 *
 * Examples:
 *   GH_TOKEN="$(gh auth token)" node scripts/sync-github-workflow.mjs --repo owner/repo --dry-run
 *   GH_TOKEN="$(gh auth token)" node scripts/sync-github-workflow.mjs --repo owner/repo --replace
 *   GH_TOKEN="$(gh auth token)" node scripts/sync-github-workflow.mjs --repo owner/repo --sync-project --project-title "My Project"
 */

import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const GITHUB_API_VERSION = "2022-11-28";
const REST_BASE_URL = "https://api.github.com";
const GRAPHQL_URL = "https://api.github.com/graphql";
const PROJECT_OPTION_COLORS = new Set([
  "GRAY",
  "BLUE",
  "GREEN",
  "YELLOW",
  "ORANGE",
  "RED",
  "PINK",
  "PURPLE",
]);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const execFileAsync = promisify(execFile);

/**
 * @typedef {{ name: string; color: string; description: string }} GitHubLabel
 * @typedef {{ name: string; color: ProjectOptionColor; description: string; id?: string }} ProjectOption
 * @typedef {{ name: string; options: ProjectOption[] }} ProjectField
 * @typedef {"GRAY"|"BLUE"|"GREEN"|"YELLOW"|"ORANGE"|"RED"|"PINK"|"PURPLE"} ProjectOptionColor
 */

function printUsage() {
  console.log(`
Usage:
  node scripts/sync-github-workflow.mjs [options]
  node scripts/sync-github-workflow.mjs --repo owner/repo [options]

  When --repo is omitted, the repository is inferred from git remote get-url origin.

Repository label options:
  --repo <owner/repo>          Repository to update. Defaults to inferring from git remote get-url origin.
  --current-repo               Alias for omitting --repo; infer repository from git remote get-url origin.
  --replace                    Delete every existing repository label, then create standard labels.
  --prune                      Delete labels not present in the standard set, then upsert standard labels.
  --dry-run                    Print intended changes without modifying GitHub.
  --labels-file <path>         Label config file. Defaults to config/labels.json.

GitHub Projects v2 options:
  --sync-project               Create/update recommended GitHub Projects v2 fields.
  --project-title <title>      Project title to target when --sync-project is used.
  --create-project             Create the Project if --project-title does not exist.
  --update-project-options     Overwrite options on existing single-select Project fields.
  --project-fields-file <path> Project field config. Defaults to config/project-fields.json.

Validation:
  --validate-only              Validate config files and exit. Does not require --repo or token.

Environment:
  GH_TOKEN or GITHUB_TOKEN must be set for GitHub mutations.
  If neither is set, the script falls back to gh auth token for local CLI usage.
`);
}

function parseArgs(argv) {
  /** @type {Record<string, string | boolean | undefined>} */
  const args = {
    labelsFile: path.join(repoRoot, "config", "labels.json"),
    projectFieldsFile: path.join(repoRoot, "config", "project-fields.json"),
    replace: false,
    prune: false,
    dryRun: false,
    currentRepo: false,
    syncProject: false,
    createProject: false,
    updateProjectOptions: false,
    validateOnly: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (!arg.startsWith("--")) {
      throw new Error(`Unexpected positional argument: ${arg}`);
    }

    const key = arg.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const next = argv[i + 1];

    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }

  return args;
}

async function readJsonFile(filePath) {
  const absolutePath = path.resolve(process.cwd(), filePath);
  const raw = await readFile(absolutePath, "utf8");
  return JSON.parse(raw);
}

async function runCommand(command, args) {
  try {
    const { stdout } = await execFileAsync(command, args, {
      cwd: process.cwd(),
      encoding: "utf8",
      windowsHide: true,
    });

    return stdout.trim();
  } catch (error) {
    const detail = error.stderr?.trim() || error.message;
    throw new Error(`${command} ${args.join(" ")} failed: ${detail}`);
  }
}

async function requireToken() {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  if (token) {
    return token;
  }

  try {
    const ghToken = await runCommand("gh", ["auth", "token"]);
    if (ghToken) {
      return ghToken;
    }
  } catch (error) {
    throw new Error(
      `Set GH_TOKEN or GITHUB_TOKEN, or authenticate with GitHub CLI. ${error.message}`,
    );
  }

  throw new Error("Set GH_TOKEN or GITHUB_TOKEN, or authenticate with GitHub CLI.");
}

function parseRepo(value) {
  if (typeof value !== "string" || !/^[^/]+\/[^/]+$/.test(value)) {
    throw new Error("Expected --repo owner/repo.");
  }

  const [owner, repo] = value.split("/");
  return { owner, repo };
}

function parseGitHubRemoteUrl(remoteUrl) {
  const trimmed = remoteUrl.trim();
  const match = [
    /^https:\/\/github\.com\/([^/]+)\/(.+)\/?$/,
    /^git@github\.com:([^/]+)\/(.+)\/?$/,
    /^ssh:\/\/git@github\.com\/([^/]+)\/(.+)\/?$/,
  ].map((pattern) => trimmed.match(pattern)).find(Boolean);

  if (!match) {
    throw new Error(`Could not infer owner/repo from origin remote: ${remoteUrl}`);
  }

  const owner = match[1];
  const repo = match[2].replace(/\/$/, "").replace(/\.git$/, "");

  if (!repo || repo.includes("/")) {
    throw new Error(`Could not infer owner/repo from origin remote: ${remoteUrl}`);
  }

  return parseRepo(`${owner}/${repo}`);
}

async function resolveRepo(args) {
  if (args.repo && args.currentRepo) {
    throw new Error("Use either --repo owner/repo or --current-repo, not both.");
  }

  if (args.currentRepo || !args.repo) {
    const remoteUrl = await runCommand("git", ["remote", "get-url", "origin"]);
    return parseGitHubRemoteUrl(remoteUrl);
  }

  return parseRepo(args.repo);
}

/** @param {unknown} labels */
function validateLabelSet(labels) {
  if (!Array.isArray(labels)) {
    throw new Error("labels config must be an array.");
  }

  const names = new Set();

  for (const label of labels) {
    if (!label || typeof label !== "object") {
      throw new Error("each label must be an object.");
    }

    const candidate = /** @type {GitHubLabel} */ (label);

    if (names.has(candidate.name)) throw new Error(`Duplicate label: ${candidate.name}`);
    names.add(candidate.name);

    if (typeof candidate.name !== "string" || candidate.name.length === 0) {
      throw new Error("label.name must be a non-empty string.");
    }

    if (!/^[0-9A-Fa-f]{6}$/.test(candidate.color)) {
      throw new Error(`Invalid 6-character hex color for ${candidate.name}: ${candidate.color}`);
    }

    if (
      typeof candidate.description !== "string" ||
      candidate.description.length === 0 ||
      candidate.description.length > 100
    ) {
      throw new Error(
        `GitHub label descriptions must be 1-100 characters: ${candidate.name}`,
      );
    }
  }
}

/** @param {unknown} fields */
function validateProjectFields(fields) {
  if (!Array.isArray(fields)) {
    throw new Error("project fields config must be an array.");
  }

  const fieldNames = new Set();

  for (const field of fields) {
    if (!field || typeof field !== "object") {
      throw new Error("each project field must be an object.");
    }

    const candidate = /** @type {ProjectField} */ (field);

    if (fieldNames.has(candidate.name)) throw new Error(`Duplicate Project field: ${candidate.name}`);
    fieldNames.add(candidate.name);

    if (typeof candidate.name !== "string" || candidate.name.length === 0) {
      throw new Error("project field name must be a non-empty string.");
    }

    if (!Array.isArray(candidate.options) || candidate.options.length === 0) {
      throw new Error(`Project field ${candidate.name} must have at least one option.`);
    }

    const optionNames = new Set();

    for (const option of candidate.options) {
      if (optionNames.has(option.name)) {
        throw new Error(`Duplicate option ${option.name} in Project field ${candidate.name}.`);
      }
      optionNames.add(option.name);

      if (typeof option.name !== "string" || option.name.length === 0) {
        throw new Error(`Option name in Project field ${candidate.name} must be non-empty.`);
      }

      if (!PROJECT_OPTION_COLORS.has(option.color)) {
        throw new Error(
          `Invalid Project option color ${option.color} for ${candidate.name}:${option.name}`,
        );
      }

      if (typeof option.description !== "string" || option.description.length === 0) {
        throw new Error(`Option description is required for ${candidate.name}:${option.name}`);
      }
    }
  }
}

function logDryRun(enabled, message) {
  console.log(enabled ? `[dry-run] ${message}` : message);
}

function encodeLabelName(name) {
  return encodeURIComponent(name);
}

async function restRequest(token, pathName, options = {}) {
  const response = await fetch(`${REST_BASE_URL}${pathName}`, {
    method: options.method || "GET",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": GITHUB_API_VERSION,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const detail = data?.message ? `: ${data.message}` : "";
    throw new Error(`${options.method || "GET"} ${pathName} failed with ${response.status}${detail}`);
  }

  return data;
}

async function graphqlRequest(token, query, variables = {}) {
  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": GITHUB_API_VERSION,
    },
    body: JSON.stringify({ query, variables }),
  });

  const data = await response.json();

  if (!response.ok || data.errors?.length) {
    const messages = data.errors?.map((error) => error.message).join("; ") || response.statusText;
    throw new Error(`GraphQL request failed: ${messages}`);
  }

  return data.data;
}

async function listRepositoryLabels(token, owner, repo) {
  /** @type {GitHubLabel[]} */
  const labels = [];

  for (let page = 1; page <= 20; page += 1) {
    const chunk = await restRequest(
      token,
      `/repos/${owner}/${repo}/labels?per_page=100&page=${page}`,
    );

    labels.push(...chunk);
    if (chunk.length < 100) break;
  }

  return labels;
}

async function deleteRepositoryLabel(token, owner, repo, labelName, dryRun) {
  logDryRun(dryRun, `delete label ${labelName}`);
  if (dryRun) return;

  await restRequest(token, `/repos/${owner}/${repo}/labels/${encodeLabelName(labelName)}`, {
    method: "DELETE",
  });
}

async function createRepositoryLabel(token, owner, repo, label, dryRun) {
  logDryRun(dryRun, `create label ${label.name}`);
  if (dryRun) return;

  await restRequest(token, `/repos/${owner}/${repo}/labels`, {
    method: "POST",
    body: {
      name: label.name,
      color: label.color,
      description: label.description,
    },
  });
}

async function updateRepositoryLabel(token, owner, repo, currentName, label, dryRun) {
  logDryRun(dryRun, `update label ${currentName}`);
  if (dryRun) return;

  await restRequest(token, `/repos/${owner}/${repo}/labels/${encodeLabelName(currentName)}`, {
    method: "PATCH",
    body: {
      new_name: label.name,
      color: label.color,
      description: label.description,
    },
  });
}

function labelsEqual(existing, desired) {
  return (
    existing.name === desired.name &&
    String(existing.color).toUpperCase() === desired.color.toUpperCase() &&
    (existing.description || "") === desired.description
  );
}

async function syncRepositoryLabels(token, owner, repo, labels, options) {
  console.log(`\nRepository labels: ${owner}/${repo}`);

  const existingLabels = await listRepositoryLabels(token, owner, repo);
  const desiredByName = new Map(labels.map((label) => [label.name, label]));
  const existingByName = new Map(existingLabels.map((label) => [label.name, label]));

  if (options.replace || options.prune) {
    for (const existing of existingLabels) {
      if (options.replace || !desiredByName.has(existing.name)) {
        await deleteRepositoryLabel(token, owner, repo, existing.name, options.dryRun);
      }
    }

    if (options.replace) {
      existingByName.clear();
    }
  }

  for (const desired of labels) {
    const existing = existingByName.get(desired.name);

    if (!existing) {
      await createRepositoryLabel(token, owner, repo, desired, options.dryRun);
      continue;
    }

    if (!labelsEqual(existing, desired)) {
      await updateRepositoryLabel(token, owner, repo, existing.name, desired, options.dryRun);
    } else {
      console.log(`unchanged label ${desired.name}`);
    }
  }
}

async function getRepositoryAndOwner(token, owner, repo) {
  const query = `
    query GetRepositoryAndOwner($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        id
        nameWithOwner
      }
      repositoryOwner(login: $owner) {
        __typename
        ... on User {
          id
          login
          projectsV2(first: 100) {
            nodes { id number title url }
          }
        }
        ... on Organization {
          id
          login
          projectsV2(first: 100) {
            nodes { id number title url }
          }
        }
      }
    }
  `;

  const data = await graphqlRequest(token, query, { owner, repo });

  if (!data.repository) throw new Error(`Repository not found: ${owner}/${repo}`);
  if (!data.repositoryOwner) throw new Error(`Repository owner not found: ${owner}`);

  return {
    repository: data.repository,
    owner: data.repositoryOwner,
    projects: data.repositoryOwner.projectsV2.nodes,
  };
}

async function createProject(token, ownerId, repositoryId, title, dryRun) {
  logDryRun(dryRun, `create Project ${title}`);
  if (dryRun) return { id: "dry-run-project-id", number: 0, title, url: "dry-run" };

  const mutation = `
    mutation CreateProject($ownerId: ID!, $repositoryId: ID!, $title: String!) {
      createProjectV2(input: { ownerId: $ownerId, repositoryId: $repositoryId, title: $title }) {
        projectV2 { id number title url }
      }
    }
  `;

  const data = await graphqlRequest(token, mutation, { ownerId, repositoryId, title });
  return data.createProjectV2.projectV2;
}

async function getProjectFields(token, projectId) {
  const query = `
    query GetProjectFields($projectId: ID!) {
      node(id: $projectId) {
        ... on ProjectV2 {
          fields(first: 100) {
            nodes {
              __typename
              ... on ProjectV2Field {
                id
                name
                dataType
              }
              ... on ProjectV2SingleSelectField {
                id
                name
                dataType
                options { id name color description }
              }
            }
          }
        }
      }
    }
  `;

  const data = await graphqlRequest(token, query, { projectId });
  return data.node.fields.nodes.filter(Boolean);
}

async function createSingleSelectProjectField(token, projectId, field, dryRun) {
  logDryRun(dryRun, `create Project field ${field.name}`);
  if (dryRun) return;

  const mutation = `
    mutation CreateSingleSelectField(
      $projectId: ID!
      $name: String!
      $options: [ProjectV2SingleSelectFieldOptionInput!]
    ) {
      createProjectV2Field(input: {
        projectId: $projectId
        name: $name
        dataType: SINGLE_SELECT
        singleSelectOptions: $options
      }) {
        projectV2Field {
          __typename
          ... on ProjectV2SingleSelectField { id name }
        }
      }
    }
  `;

  await graphqlRequest(token, mutation, {
    projectId,
    name: field.name,
    options: field.options,
  });
}

async function updateSingleSelectProjectField(token, existingField, desiredField, dryRun) {
  logDryRun(dryRun, `update Project field options ${desiredField.name}`);
  if (dryRun) return;

  const existingOptionsByName = new Map(
    (existingField.options || []).map((option) => [option.name, option]),
  );

  const options = desiredField.options.map((option) => {
    const existing = existingOptionsByName.get(option.name);
    return existing?.id ? { ...option, id: existing.id } : option;
  });

  const mutation = `
    mutation UpdateSingleSelectField(
      $fieldId: ID!
      $options: [ProjectV2SingleSelectFieldOptionInput!]
    ) {
      updateProjectV2Field(input: {
        fieldId: $fieldId
        singleSelectOptions: $options
      }) {
        projectV2Field {
          __typename
          ... on ProjectV2SingleSelectField { id name }
        }
      }
    }
  `;

  await graphqlRequest(token, mutation, {
    fieldId: existingField.id,
    options,
  });
}

async function syncProjectFields(token, owner, repo, projectFields, options) {
  if (!options.projectTitle || typeof options.projectTitle !== "string") {
    throw new Error("--sync-project requires --project-title \"Project Name\".");
  }

  console.log(`\nProject fields: ${options.projectTitle}`);

  const info = await getRepositoryAndOwner(token, owner, repo);
  let project = info.projects.find((candidate) => candidate.title === options.projectTitle);

  if (!project) {
    if (!options.createProject) {
      throw new Error(
        `Project not found: ${options.projectTitle}. Re-run with --create-project to create it.`,
      );
    }

    project = await createProject(
      token,
      info.owner.id,
      info.repository.id,
      options.projectTitle,
      options.dryRun,
    );
  }

  console.log(`Project: ${project.title} ${project.url}`);

  if (options.dryRun && project.id === "dry-run-project-id") {
    for (const field of projectFields) {
      logDryRun(true, `would create Project field ${field.name}`);
    }
    return;
  }

  const existingFields = await getProjectFields(token, project.id);
  const existingByName = new Map(existingFields.map((field) => [field.name, field]));

  for (const desiredField of projectFields) {
    const existingField = existingByName.get(desiredField.name);

    if (!existingField) {
      await createSingleSelectProjectField(token, project.id, desiredField, options.dryRun);
      continue;
    }

    if (existingField.__typename !== "ProjectV2SingleSelectField") {
      console.warn(
        `skip Project field ${desiredField.name}: existing field is ${existingField.__typename}, not single-select`,
      );
      continue;
    }

    if (options.updateProjectOptions) {
      await updateSingleSelectProjectField(token, existingField, desiredField, options.dryRun);
    } else {
      console.log(
        `unchanged Project field ${desiredField.name} (use --update-project-options to overwrite options)`,
      );
    }
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || args.h) {
    printUsage();
    return;
  }

  const labels = await readJsonFile(String(args.labelsFile));
  const projectFields = await readJsonFile(String(args.projectFieldsFile));

  validateLabelSet(labels);
  validateProjectFields(projectFields);

  if (args.validateOnly) {
    console.log("Config files are valid.");
    return;
  }

  const token = await requireToken();
  const { owner, repo } = await resolveRepo(args);

  await syncRepositoryLabels(token, owner, repo, labels, {
    replace: Boolean(args.replace),
    prune: Boolean(args.prune),
    dryRun: Boolean(args.dryRun),
  });

  if (args.syncProject) {
    await syncProjectFields(token, owner, repo, projectFields, {
      projectTitle: args.projectTitle,
      createProject: Boolean(args.createProject),
      updateProjectOptions: Boolean(args.updateProjectOptions),
      dryRun: Boolean(args.dryRun),
    });
  }

  console.log("\nDone.");
}

main().catch((error) => {
  console.error(`\nError: ${error.message}`);
  process.exitCode = 1;
});
