const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const yaml = require('js-yaml');

// Mock console.log and console.error to capture output
const originalLog = console.log;
const originalError = console.error;
let logOutput = [];
let errorOutput = [];

beforeEach(() => {
  logOutput = [];
  errorOutput = [];
  console.log = (...args) => logOutput.push(args.join(' '));
  console.error = (...args) => errorOutput.push(args.join(' '));
});

afterEach(() => {
  console.log = originalLog;
  console.error = originalError;
});

describe('Ticket CLI System', () => {
  const TEST_TICKET_ROOT = path.join(__dirname, '../../test-tickets');
  const TICKET_CLI_PATH = path.join(__dirname, '../../scripts/ticket-cli.js');
  
  beforeEach(() => {
    // Create test ticket directory structure
    const states = ['backlog', 'todo', 'in-progress', 'review', 'done', 'blocked', 'archive'];
    
    if (fs.existsSync(TEST_TICKET_ROOT)) {
      fs.rmSync(TEST_TICKET_ROOT, { recursive: true, force: true });
    }
    
    fs.mkdirSync(TEST_TICKET_ROOT, { recursive: true });
    states.forEach(state => {
      fs.mkdirSync(path.join(TEST_TICKET_ROOT, state), { recursive: true });
    });
    
    // Set test environment
    process.env.TEST_TICKET_ROOT = TEST_TICKET_ROOT;
  });
  
  afterEach(() => {
    // Cleanup test tickets
    if (fs.existsSync(TEST_TICKET_ROOT)) {
      fs.rmSync(TEST_TICKET_ROOT, { recursive: true, force: true });
    }
    delete process.env.TEST_TICKET_ROOT;
  });

  describe('Ticket Creation', () => {
    test('should create ticket with valid parameters', () => {
      const result = execSync(`node ${TICKET_CLI_PATH} create -t "Test Ticket" -d "Test description" --type feature -p high`, {
        cwd: process.cwd(),
        env: { ...process.env, TICKET_ROOT: TEST_TICKET_ROOT },
        encoding: 'utf8'
      });

      // Check that ticket was created
      expect(result).toContain('Created ticket');
      expect(result).toContain('in backlog');

      // Verify ticket file exists
      const backlogDir = path.join(TEST_TICKET_ROOT, 'backlog');
      const ticketFiles = fs.readdirSync(backlogDir);
      expect(ticketFiles).toHaveLength(1);
      expect(ticketFiles[0]).toMatch(/^TICKET-[\w-]+\.md$/);

      // Verify ticket content
      const ticketPath = path.join(backlogDir, ticketFiles[0]);
      const content = fs.readFileSync(ticketPath, 'utf8');
      const [, frontmatter, body] = content.split('---\n');
      const metadata = yaml.load(frontmatter);

      expect(metadata.title).toBe('Test Ticket');
      expect(metadata.status).toBe('backlog');
      expect(metadata.priority).toBe('high');
      expect(metadata.type).toBe('feature');
      expect(body.trim()).toBe('Test description');
    });

    test('should reject invalid priority', () => {
      expect(() => {
        execSync(`node ${TICKET_CLI_PATH} create -t "Test" -p invalid`, {
          env: { ...process.env, TICKET_ROOT: TEST_TICKET_ROOT },
          encoding: 'utf8'
        });
      }).toThrow();
    });

    test('should reject invalid type', () => {
      expect(() => {
        execSync(`node ${TICKET_CLI_PATH} create -t "Test" --type invalid`, {
          env: { ...process.env, TICKET_ROOT: TEST_TICKET_ROOT },
          encoding: 'utf8'
        });
      }).toThrow();
    });

    test('should handle labels correctly', () => {
      const result = execSync(`node ${TICKET_CLI_PATH} create -t "Test Ticket" -l "label1,label2,label3"`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKET_ROOT },
        encoding: 'utf8'
      });

      const backlogDir = path.join(TEST_TICKET_ROOT, 'backlog');
      const ticketFiles = fs.readdirSync(backlogDir);
      const ticketPath = path.join(backlogDir, ticketFiles[0]);
      const content = fs.readFileSync(ticketPath, 'utf8');
      const [, frontmatter] = content.split('---\n');
      const metadata = yaml.load(frontmatter);

      expect(metadata.labels).toEqual(['label1', 'label2', 'label3']);
    });
  });

  describe('Ticket Movement', () => {
    let testTicketId;

    beforeEach(() => {
      // Create a test ticket first
      const result = execSync(`node ${TICKET_CLI_PATH} create -t "Test Ticket" -d "Test description"`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKET_ROOT },
        encoding: 'utf8'
      });
      
      // Extract ticket ID from output
      const match = result.match(/Created ticket (TICKET-[\w-]+)/);
      testTicketId = match[1];
    });

    test('should move ticket between valid states', () => {
      const result = execSync(`node ${TICKET_CLI_PATH} move ${testTicketId} todo`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKET_ROOT },
        encoding: 'utf8'
      });

      expect(result).toContain(`Moved ticket ${testTicketId} to todo`);

      // Verify ticket moved from backlog to todo
      const backlogFiles = fs.readdirSync(path.join(TEST_TICKET_ROOT, 'backlog'));
      const todoFiles = fs.readdirSync(path.join(TEST_TICKET_ROOT, 'todo'));
      
      expect(backlogFiles).toHaveLength(0);
      expect(todoFiles).toHaveLength(1);
      expect(todoFiles[0]).toBe(`${testTicketId}.md`);

      // Verify metadata updated
      const ticketPath = path.join(TEST_TICKET_ROOT, 'todo', `${testTicketId}.md`);
      const content = fs.readFileSync(ticketPath, 'utf8');
      const [, frontmatter] = content.split('---\n');
      const metadata = yaml.load(frontmatter);
      
      expect(metadata.status).toBe('todo');
      expect(metadata.updated_at).toBeDefined();
    });

    test('should reject invalid state transitions', () => {
      expect(() => {
        execSync(`node ${TICKET_CLI_PATH} move ${testTicketId} invalid-state`, {
          env: { ...process.env, TICKET_ROOT: TEST_TICKET_ROOT },
          encoding: 'utf8'
        });
      }).toThrow();
    });

    test('should handle non-existent ticket', () => {
      expect(() => {
        execSync(`node ${TICKET_CLI_PATH} move TICKET-nonexistent todo`, {
          env: { ...process.env, TICKET_ROOT: TEST_TICKET_ROOT },
          encoding: 'utf8'
        });
      }).toThrow();
    });
  });

  describe('Ticket Assignment', () => {
    let testTicketId;

    beforeEach(() => {
      const result = execSync(`node ${TICKET_CLI_PATH} create -t "Test Ticket"`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKET_ROOT },
        encoding: 'utf8'
      });
      const match = result.match(/Created ticket (TICKET-[\w-]+)/);
      testTicketId = match[1];
    });

    test('should assign ticket to user', () => {
      const result = execSync(`node ${TICKET_CLI_PATH} assign ${testTicketId} john.doe`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKET_ROOT },
        encoding: 'utf8'
      });

      expect(result).toContain(`Assigned ticket ${testTicketId} to john.doe`);

      // Verify assignment in metadata
      const ticketPath = path.join(TEST_TICKET_ROOT, 'backlog', `${testTicketId}.md`);
      const content = fs.readFileSync(ticketPath, 'utf8');
      const [, frontmatter] = content.split('---\n');
      const metadata = yaml.load(frontmatter);
      
      expect(metadata.assignee).toBe('john.doe');
    });
  });

  describe('Ticket Comments', () => {
    let testTicketId;

    beforeEach(() => {
      const result = execSync(`node ${TICKET_CLI_PATH} create -t "Test Ticket"`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKET_ROOT },
        encoding: 'utf8'
      });
      const match = result.match(/Created ticket (TICKET-[\w-]+)/);
      testTicketId = match[1];
    });

    test('should add comment to ticket', () => {
      const result = execSync(`node ${TICKET_CLI_PATH} comment ${testTicketId} "This is a test comment"`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKET_ROOT },
        encoding: 'utf8'
      });

      expect(result).toContain(`Added comment to ticket ${testTicketId}`);

      // Verify comment in metadata
      const ticketPath = path.join(TEST_TICKET_ROOT, 'backlog', `${testTicketId}.md`);
      const content = fs.readFileSync(ticketPath, 'utf8');
      const [, frontmatter] = content.split('---\n');
      const metadata = yaml.load(frontmatter);
      
      expect(metadata.comments).toHaveLength(1);
      expect(metadata.comments[0].comment).toBe('This is a test comment');
      expect(metadata.comments[0].author).toBeDefined();
      expect(metadata.comments[0].timestamp).toBeDefined();
    });
  });

  describe('Ticket Listing', () => {
    beforeEach(() => {
      // Create multiple test tickets
      execSync(`node ${TICKET_CLI_PATH} create -t "Bug Ticket" --type bug -p high`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKET_ROOT },
        encoding: 'utf8'
      });
      execSync(`node ${TICKET_CLI_PATH} create -t "Feature Ticket" --type feature -p medium`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKET_ROOT },
        encoding: 'utf8'
      });
    });

    test('should list all tickets', () => {
      const result = execSync(`node ${TICKET_CLI_PATH} list`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKET_ROOT },
        encoding: 'utf8'
      });

      expect(result).toContain('Bug Ticket');
      expect(result).toContain('Feature Ticket');
    });

    test('should filter tickets by type', () => {
      const result = execSync(`node ${TICKET_CLI_PATH} list --type bug`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKET_ROOT },
        encoding: 'utf8'
      });

      expect(result).toContain('Bug Ticket');
      expect(result).not.toContain('Feature Ticket');
    });

    test('should filter tickets by priority', () => {
      const result = execSync(`node ${TICKET_CLI_PATH} list --priority high`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKET_ROOT },
        encoding: 'utf8'
      });

      expect(result).toContain('Bug Ticket');
      expect(result).not.toContain('Feature Ticket');
    });
  });

  describe('Ticket Archiving', () => {
    let testTicketId;

    beforeEach(() => {
      const result = execSync(`node ${TICKET_CLI_PATH} create -t "Test Ticket"`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKET_ROOT },
        encoding: 'utf8'
      });
      const match = result.match(/Created ticket (TICKET-[\w-]+)/);
      testTicketId = match[1];
    });

    test('should archive ticket', () => {
      const result = execSync(`node ${TICKET_CLI_PATH} archive ${testTicketId}`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKET_ROOT },
        encoding: 'utf8'
      });

      expect(result).toContain(`Archived ticket ${testTicketId}`);

      // Verify ticket moved to archive
      const backlogFiles = fs.readdirSync(path.join(TEST_TICKET_ROOT, 'backlog'));
      const archiveFiles = fs.readdirSync(path.join(TEST_TICKET_ROOT, 'archive'));
      
      expect(backlogFiles).toHaveLength(0);
      expect(archiveFiles).toHaveLength(1);
      expect(archiveFiles[0]).toBe(`${testTicketId}.md`);

      // Verify status updated to archive
      const ticketPath = path.join(TEST_TICKET_ROOT, 'archive', `${testTicketId}.md`);
      const content = fs.readFileSync(ticketPath, 'utf8');
      const [, frontmatter] = content.split('---\n');
      const metadata = yaml.load(frontmatter);
      
      expect(metadata.status).toBe('archive');
    });
  });

  describe('Ticket Show Details', () => {
    let testTicketId;

    beforeEach(() => {
      const result = execSync(`node ${TICKET_CLI_PATH} create -t "Test Ticket" -d "Detailed description"`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKET_ROOT },
        encoding: 'utf8'
      });
      const match = result.match(/Created ticket (TICKET-[\w-]+)/);
      testTicketId = match[1];
    });

    test('should show ticket details', () => {
      const result = execSync(`node ${TICKET_CLI_PATH} show ${testTicketId}`, {
        env: { ...process.env, TICKET_ROOT: TEST_TICKET_ROOT },
        encoding: 'utf8'
      });

      expect(result).toContain('Ticket Details:');
      expect(result).toContain('Test Ticket');
      expect(result).toContain('Description:');
      expect(result).toContain('Detailed description');
    });

    test('should handle non-existent ticket', () => {
      expect(() => {
        execSync(`node ${TICKET_CLI_PATH} show TICKET-nonexistent`, {
          env: { ...process.env, TICKET_ROOT: TEST_TICKET_ROOT },
          encoding: 'utf8'
        });
      }).toThrow();
    });
  });
}); 