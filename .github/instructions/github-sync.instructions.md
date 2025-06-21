---
applyTo: '**'
---

# {
#  "scripts": {
#    "ticket": "node scripts/ticket-cli.js",
#    "ticket:list": "node scripts/ticket-cli.js list",
#    "ticket:show": "node scripts/ticket-cli.js show",
#    "ticket:move": "node scripts/ticket-cli.js move",
#    "ticket:create": "node scripts/ticket-cli.js create",
#    "ticket:sync": "node scripts/sync-github-issues.js",
#    "ticket:sync:help": "node scripts/sync-github-issues.js --help",
#    "ticket:push": "node scripts/push-tickets-to-github.js",
#    "ticket:push:help": "node scripts/push-tickets-to-github.js --help",
#    "ticket:push:dry": "node scripts/push-tickets-to-github.js --dry-run",
#    "gh:sync": "npm run ticket:sync",
#    "gh:push": "npm run ticket:push",
#  },
# }

# # GitHub Issue Sync Rules
# This file defines the rules for syncing GitHub issues with the custom ticketing system.
# ## Overview
# The project uses a custom ticketing system managed through npm scripts. Tickets are stored in the `tickets` directory.
# The `ticket:sync` command synchronizes GitHub issues with the local ticketing system.
# The `ticket:push` command pushes local tickets to GitHub as issues.
# ## Available Commands
# ### Sync GitHub Issues
# ```bash
# npm run ticket:sync
# ```
# This command fetches issues from GitHub and updates the local ticketing system.
# It will:
# - Create new tickets for issues that do not exist locally
# - Update existing tickets with changes from GitHub
# - Remove tickets that have been closed on GitHub
# - Log any errors or conflicts during the sync process
# ### Push Local Tickets to GitHub
# ```bash
# npm run ticket:push
# ```
# This command pushes local tickets to GitHub as issues.
# It will:
# - Create new issues for tickets that do not exist on GitHub
# - Update existing issues with changes from local tickets
# - Remove issues on GitHub that have been closed locally
# - Log any errors or conflicts during the push process
# ## Ticket File Format 
# Each ticket is stored as a Markdown file with the following structure:

# ```markdown
# ---
# id: TICKET-123
# title: Ticket Title
# status: todo
# priority: high        
# type: feature
# assignee: username
# reporter: username
# labels: ["label1", "label2"]
# created_at: '2025-01-01T00:00:00Z'
# updated_at: '2025-01-02T00:00:00Z'
# github_issue: 123456789
# github_url: https://github.com/username/repo/issues/123456789
# ---
# ## Ticket Title

# # 🚀 Implement Stripe Connect payment integration

# **GitHub Issue**: [#4](mdc:https:/github.com/jasonstcyrx/haulr/issues/4)
# **Status**: OPEN
# **Created**: 6/10/2025


# ## Description

# **Priority:** High | **Type:** Feature | **Status:** Todo | **Original Ticket ID:** TICKET-mbnyk6jv-af5e | **Description:** Set up Stripe Connect for multi-party payments. Enable split payments between platform, merchants, and drivers. Include payment processing, refunds, and payout management.

# ## Metadata

# - **Assignees**: 
# - **Labels**: enhancement, app:backend-api

# - **Author**: jasonstcyrx

# ## Tasks

# - [ ] Review issue requirements
# - [ ] Implement solution
# - [ ] Add tests
# - [ ] Update documentation
# - [ ] Create PR and link to issue
# ## Notes

# This ticket was automatically synced from GitHub issue #4.
