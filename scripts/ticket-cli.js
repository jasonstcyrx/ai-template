#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { program } = require("commander");
const { v4: uuidv4 } = require("uuid");

const TICKET_ROOT = process.env.TICKET_ROOT || path.join(process.cwd(), "tickets");
const VALID_STATUSES = [
  "backlog",
  "todo",
  "in-progress",
  "review",
  "done",
  "blocked",
  "archive",
];
const VALID_PRIORITIES = ["low", "medium", "high", "critical"];
const VALID_TYPES = ["bug", "feature", "task", "spike"];

// Helper Functions
const generateTicketId = () =>
  `TICKET-${Date.now().toString(36)}-${uuidv4().slice(0, 4)}`;

const createTicketContent = (metadata, description = "") => {
  const frontmatter = yaml.dump(metadata);
  return `---\n${frontmatter}---\n\n${description}`;
};

const parseTicketFile = (filePath) => {
  const content = fs.readFileSync(filePath, "utf8");
  const [, frontmatter, body] = content.split("---\n");
  return {
    metadata: yaml.load(frontmatter),
    body: body.trim(),
  };
};

const findTicketPath = (ticketId) => {
  for (const status of VALID_STATUSES) {
    const filePath = path.join(TICKET_ROOT, status, `${ticketId}.md`);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  return null;
};

// Commands
program.version("1.0.0").description("Ticket Management System");

program
  .command("create")
  .description("Create a new ticket")
  .requiredOption("-t, --title <title>", "Ticket title")
  .option("-d, --description <description>", "Ticket description")
  .option("-p, --priority <priority>", "Ticket priority", "medium")
  .option("--type <type>", "Ticket type", "task")
  .option("-a, --assignee <assignee>", "Assignee")
  .option("-l, --labels <labels>", "Comma-separated labels")
  .action((options) => {
    if (!VALID_PRIORITIES.includes(options.priority)) {
      console.error(
        `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(", ")}`,
      );
      process.exit(1);
    }

    if (!VALID_TYPES.includes(options.type)) {
      console.error(`Invalid type. Must be one of: ${VALID_TYPES.join(", ")}`);
      process.exit(1);
    }

    const ticketId = generateTicketId();
    const now = new Date().toISOString();

    const metadata = {
      id: ticketId,
      title: options.title,
      status: "backlog",
      priority: options.priority,
      type: options.type,
      assignee: options.assignee || null,
      reporter: process.env.USER || "unknown",
      labels: options.labels ? options.labels.split(",") : [],
      created_at: now,
      updated_at: now,
      comments: [],
    };

    // Ensure backlog directory exists
    const backlogDir = path.join(TICKET_ROOT, "backlog");
    if (!fs.existsSync(backlogDir)) {
      fs.mkdirSync(backlogDir, { recursive: true });
    }

    const ticketPath = path.join(TICKET_ROOT, "backlog", `${ticketId}.md`);
    fs.writeFileSync(
      ticketPath,
      createTicketContent(metadata, options.description || ""),
    );

    console.log(`Created ticket ${ticketId} in backlog`);
  });

program
  .command("move <ticketId> <status>")
  .description("Move a ticket to a different status")
  .action((ticketId, newStatus) => {
    if (!VALID_STATUSES.includes(newStatus)) {
      console.error(
        `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      );
      process.exit(1);
    }

    const currentPath = findTicketPath(ticketId);
    if (!currentPath) {
      console.error(`Ticket ${ticketId} not found`);
      process.exit(1);
    }

    const { metadata, body } = parseTicketFile(currentPath);
    metadata.status = newStatus;
    metadata.updated_at = new Date().toISOString();

    // Ensure destination directory exists
    const destinationDir = path.join(TICKET_ROOT, newStatus);
    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true });
    }

    const newPath = path.join(TICKET_ROOT, newStatus, `${ticketId}.md`);
    fs.writeFileSync(newPath, createTicketContent(metadata, body));
    fs.unlinkSync(currentPath);

    console.log(`Moved ticket ${ticketId} to ${newStatus}`);
  });

program
  .command("comment <ticketId> <comment>")
  .description("Add a comment to a ticket")
  .action((ticketId, comment) => {
    const ticketPath = findTicketPath(ticketId);
    if (!ticketPath) {
      console.error(`Ticket ${ticketId} not found`);
      process.exit(1);
    }

    const { metadata, body } = parseTicketFile(ticketPath);
    metadata.comments.push({
      author: process.env.USER || "unknown",
      comment,
      timestamp: new Date().toISOString(),
    });
    metadata.updated_at = new Date().toISOString();

    fs.writeFileSync(ticketPath, createTicketContent(metadata, body));
    console.log(`Added comment to ticket ${ticketId}`);
  });

program
  .command("list")
  .description("List tickets")
  .option("-s, --status <status>", "Filter by status")
  .option("-a, --assignee <assignee>", "Filter by assignee")
  .option("-t, --type <type>", "Filter by type")
  .option("-p, --priority <priority>", "Filter by priority")
  .action((options) => {
    const tickets = [];

    const statuses = options.status ? [options.status] : VALID_STATUSES;
    for (const status of statuses) {
      const statusDir = path.join(TICKET_ROOT, status);
      if (!fs.existsSync(statusDir)) continue;

      const files = fs
        .readdirSync(statusDir)
        .filter((file) => file.endsWith(".md"));

      for (const file of files) {
        const { metadata } = parseTicketFile(path.join(statusDir, file));

        if (options.assignee && metadata.assignee !== options.assignee)
          continue;
        if (options.type && metadata.type !== options.type) continue;
        if (options.priority && metadata.priority !== options.priority)
          continue;

        tickets.push({
          id: metadata.id,
          title: metadata.title,
          status: metadata.status,
          priority: metadata.priority,
          type: metadata.type,
          assignee: metadata.assignee || "unassigned",
        });
      }
    }

    console.table(tickets);
  });

program
  .command("show <ticketId>")
  .description("Show ticket details")
  .action((ticketId) => {
    const ticketPath = findTicketPath(ticketId);
    if (!ticketPath) {
      console.error(`Ticket ${ticketId} not found`);
      process.exit(1);
    }

    const { metadata, body } = parseTicketFile(ticketPath);

    console.log("\nTicket Details:");
    console.log("---------------");
    console.log(yaml.dump(metadata));

    console.log("\nDescription:");
    console.log("------------");
    console.log(body);

    if (metadata.comments.length > 0) {
      console.log("\nComments:");
      console.log("---------");
      metadata.comments.forEach((comment, index) => {
        console.log(`${index + 1}. ${comment.author} (${comment.timestamp}):`);
        console.log(`   ${comment.comment}\n`);
      });
    }
  });

program
  .command("assign <ticketId> <assignee>")
  .description("Assign a ticket to someone")
  .action((ticketId, assignee) => {
    const ticketPath = findTicketPath(ticketId);
    if (!ticketPath) {
      console.error(`Ticket ${ticketId} not found`);
      process.exit(1);
    }

    const { metadata, body } = parseTicketFile(ticketPath);
    metadata.assignee = assignee;
    metadata.updated_at = new Date().toISOString();

    fs.writeFileSync(ticketPath, createTicketContent(metadata, body));
    console.log(`Assigned ticket ${ticketId} to ${assignee}`);
  });

program
  .command("archive <ticketId>")
  .description("Archive a ticket")
  .action((ticketId) => {
    const ticketPath = findTicketPath(ticketId);
    if (!ticketPath) {
      console.error(`Ticket ${ticketId} not found`);
      process.exit(1);
    }

    const { metadata, body } = parseTicketFile(ticketPath);
    metadata.status = "archive";
    metadata.updated_at = new Date().toISOString();

    // Ensure archive directory exists
    const archiveDir = path.join(TICKET_ROOT, "archive");
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir, { recursive: true });
    }

    const archivePath = path.join(TICKET_ROOT, "archive", `${ticketId}.md`);
    fs.writeFileSync(archivePath, createTicketContent(metadata, body));
    fs.unlinkSync(ticketPath);

    console.log(`Archived ticket ${ticketId}`);
  });

program.parse(process.argv);
