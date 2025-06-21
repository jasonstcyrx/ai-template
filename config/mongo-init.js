// MongoDB initialization script
// This script runs when the container is first created

print('Starting MongoDB initialization...');

// Switch to the procurement database
db = db.getSiblingDB('procurement_db');

// Create application user
db.createUser({
  user: 'app_user',
  pwd: 'app_password',
  roles: [
    {
      role: 'readWrite',
      db: 'procurement_db'
    }
  ]
});

// Create initial collections with validation schemas
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'name'],
      properties: {
        email: {
          bsonType: 'string',
          description: 'Email address - required and must be a string'
        },
        name: {
          bsonType: 'string',
          description: 'User name - required and must be a string'
        },
        role: {
          bsonType: 'string',
          enum: ['admin', 'user', 'manager'],
          description: 'User role - must be one of admin, user, or manager'
        },
        isActive: {
          bsonType: 'bool',
          description: 'User active status'
        },
        createdAt: {
          bsonType: 'date',
          description: 'Creation timestamp'
        },
        updatedAt: {
          bsonType: 'date',
          description: 'Last update timestamp'
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isActive: 1 });
db.users.createIndex({ createdAt: 1 });

// Create procurement collection
db.createCollection('procurement_orders', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'items', 'status'],
      properties: {
        userId: {
          bsonType: 'objectId',
          description: 'User ID - required'
        },
        items: {
          bsonType: 'array',
          description: 'Array of procurement items'
        },
        status: {
          bsonType: 'string',
          enum: ['pending', 'approved', 'ordered', 'delivered', 'cancelled'],
          description: 'Order status'
        },
        totalAmount: {
          bsonType: 'number',
          description: 'Total order amount'
        },
        vendorId: {
          bsonType: 'string',
          description: 'Vendor identifier'
        },
        createdAt: {
          bsonType: 'date',
          description: 'Creation timestamp'
        }
      }
    }
  }
});

// Create indexes for procurement orders
db.procurement_orders.createIndex({ userId: 1 });
db.procurement_orders.createIndex({ status: 1 });
db.procurement_orders.createIndex({ vendorId: 1 });
db.procurement_orders.createIndex({ createdAt: 1 });

// Create analytics collection for waste tracking
db.createCollection('waste_analytics', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['type', 'amount', 'date'],
      properties: {
        type: {
          bsonType: 'string',
          enum: ['inventory', 'subscription', 'operational', 'vendor'],
          description: 'Type of waste'
        },
        amount: {
          bsonType: 'number',
          description: 'Waste amount in currency'
        },
        date: {
          bsonType: 'date',
          description: 'Waste occurrence date'
        },
        category: {
          bsonType: 'string',
          description: 'Waste category'
        },
        preventable: {
          bsonType: 'bool',
          description: 'Whether this waste could have been prevented'
        }
      }
    }
  }
});

// Create indexes for analytics
db.waste_analytics.createIndex({ type: 1, date: 1 });
db.waste_analytics.createIndex({ date: 1 });
db.waste_analytics.createIndex({ preventable: 1 });

// Insert sample data for development
if (db.users.countDocuments() === 0) {
  print('Inserting sample data...');
  
  // Sample users
  db.users.insertMany([
    {
      email: 'admin@procurement.com',
      name: 'System Administrator',
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      email: 'manager@procurement.com',
      name: 'Procurement Manager',
      role: 'manager',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      email: 'user@procurement.com',
      name: 'Regular User',
      role: 'user',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  
  print('Sample data inserted successfully.');
}

print('MongoDB initialization completed successfully.');
print('Database: procurement_db');
print('Collections created: users, procurement_orders, waste_analytics');
print('Indexes created for optimal performance');
print('Application user created: app_user'); 