# GitHub Copilot Instructions for xrelease

## Project Overview

**xrelease** is a release automation CLI tool for managing semantic versioning, changelogs, and GitHub releases.

## Issue Tracking with bd

**CRITICAL**: This project uses **bd (beads)** for ALL task tracking. Do NOT create markdown TODO lists.

### Essential Commands

```bash
# Find work
bd ready --json                    # Unblocked issues

# Create and manage
bd create "Title" -t bug|feature|task -p 0-4 --json
bd create "Subtask" --parent <epic-id> --json  # Hierarchical subtask
bd update <id> --status in_progress --json
bd close <id> --reason "Done" --json

# Search
bd list --status open --priority 1 --json
bd show <id> --json
```

### Workflow

1. **Check ready work**: `bd ready --json`
2. **Claim task**: `bd update <id> --status in_progress`
3. **Work on it**: Implement, test, document
4. **Discover new work?** `bd create "Found bug" -p 1 --deps discovered-from:<parent-id> --json`
5. **Complete**: `bd close <id> --reason "Done" --json`

### Priorities

- `0` - Critical (security, data loss, broken builds)
- `1` - High (major features, important bugs)
- `2` - Medium (default, nice-to-have)
- `3` - Low (polish, optimization)
- `4` - Backlog (future ideas)

## CLI Help

Run `bd <command> --help` to see all available flags for any command.

## Important Rules

- Use bd for ALL task tracking
- Always use `--json` flag for programmatic use
- Run `bd <cmd> --help` to discover available flags
- Do NOT create markdown TODO lists
- Do NOT commit `.beads/beads.db` (JSONL only)

---

**For detailed workflows, see [AGENTS.md](../AGENTS.md)**
