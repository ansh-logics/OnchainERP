# Database Migration Guide: MongoDB to Hybrid (PostgreSQL + MongoDB)

## Overview

This guide explains the migration from a pure MongoDB setup to a hybrid architecture using PostgreSQL for structured data and MongoDB for unstructured data.

## Architecture

### PostgreSQL (Structured Data)
- User management
- College, Department, Faculty information
- Student enrollment and academic records
- Financial transactions
- Course management
- Sections and academic structure

### MongoDB (Unstructured Data)
- File uploads and metadata
- System logs and audit trails
- Analytics and reports
- Notifications
- Flexible configurations
- Document storage

## Prerequisites

1. **PostgreSQL 15+** installed locally or via Docker
2. **MongoDB 7.0+** running
3. **Node.js 18+**
4. Updated environment variables

## Setup Instructions

### 1. Start Databases

Using Docker (Recommended):
```bash
docker-compose up -d postgres mongodb
```

Or install locally:
- PostgreSQL: https://postgresql.org/download/
- MongoDB: https://docs.mongodb.com/manual/installation/

### 2. Configure Environment

Copy the example environment file:
```bash
cp .env.example .env
```

Update the database connection strings in `.env`:
```env
# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=onchain_erp
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

# MongoDB  
MONGODB_URI=mongodb://localhost:27017/onchain_erp
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

### 4. Run Migration

```bash
# Test database connections
npm run db:setup

# Run the migration (this will migrate existing MongoDB data to PostgreSQL)
npm run migrate

# Start the application
npm run dev
```

## Migration Process

The migration script (`src/utils/migration.js`) performs the following:

1. **Users**: Migrates all user accounts to PostgreSQL
2. **Colleges**: Transfers college information with proper normalization
3. **Departments**: Migrates department structure and configurations
4. **Students**: Moves student profiles and academic data
5. **Faculty**: Transfers faculty information and assignments
6. **Courses**: Migrates course catalog
7. **Transactions**: Moves financial transaction data

### Data Mapping

#### MongoDB → PostgreSQL

| MongoDB Collection | PostgreSQL Table | Notes |
|-------------------|------------------|-------|
| users | users | Direct mapping with UUIDs |
| colleges | colleges | Address/contact fields flattened |
| departments | departments | Section config normalized |
| students | students | Personal details flattened |
| faculty | faculty | Employment details structured |
| courses | courses | Academic structure preserved |
| transactions | transactions | Financial data with references |

#### Files & Logs → MongoDB

- **File uploads**: Metadata stored in MongoDB with file references
- **System logs**: All application logs and audit trails
- **Analytics**: Flexible reporting data
- **Notifications**: User notification system
- **Configurations**: Dynamic settings and preferences

## Benefits of Hybrid Architecture

### PostgreSQL Advantages
- **ACID compliance** for critical business data
- **Complex queries** and joins for reporting
- **Data integrity** with foreign key constraints
- **Mature ecosystem** with excellent tooling
- **Performance** for structured queries

### MongoDB Advantages
- **Flexible schema** for varying document structures
- **Horizontal scaling** for large file metadata
- **JSON-native** storage for logs and analytics
- **GridFS** for large file storage
- **Aggregation pipeline** for complex analytics

## API Changes

The application now supports both databases seamlessly:

### Structured Data (PostgreSQL)
- User management endpoints
- Academic structure APIs
- Financial transaction APIs
- Student/Faculty management

### Unstructured Data (MongoDB)
- File upload APIs
- Logging and analytics
- Notification system
- Configuration management

## Development Workflow

### Database Management

```bash
# Reset PostgreSQL schema (development only)
npm run db:reset

# View PostgreSQL data
docker-compose exec postgres psql -U postgres -d onchain_erp

# View MongoDB data
docker-compose exec mongodb mongosh onchain_erp
```

### Admin Interfaces

- **pgAdmin**: http://localhost:8080 (admin@onchainerp.com / admin123)
- **Mongo Express**: http://localhost:8081 (admin / admin123)

## Testing

```bash
# Run all tests
npm test

# Test database connections
npm run db:setup
```

## Monitoring

The hybrid setup includes logging and monitoring:

- **System logs** stored in MongoDB
- **Performance metrics** tracked per database
- **Error tracking** with detailed stack traces
- **Audit trails** for all user actions

## Backup Strategy

### PostgreSQL
```bash
pg_dump -h localhost -U postgres onchain_erp > backup_postgres.sql
```

### MongoDB
```bash
mongodump --host localhost:27017 --db onchain_erp --out backup_mongodb/
```

## Rollback Plan

If migration issues occur:

1. **Stop the application**
2. **Restore MongoDB data** from backup
3. **Switch back to old MongoDB-only models**
4. **Update server.js** to use old database config

## Performance Optimization

### PostgreSQL
- Indexes on foreign keys and frequently queried fields
- Connection pooling configured
- Query optimization for joins

### MongoDB
- Compound indexes for complex queries
- TTL indexes for log cleanup
- Aggregation pipeline optimization

## Security Considerations

- **Separate credentials** for each database
- **Network isolation** using Docker networks
- **Encrypted connections** in production
- **Role-based access** control

## Production Deployment

### Environment Variables
```env
NODE_ENV=production
POSTGRES_HOST=your-postgres-host
MONGODB_URI=mongodb://your-mongodb-cluster
```

### SSL Configuration
- Enable SSL for PostgreSQL connections
- Use MongoDB Atlas or secured MongoDB instance
- Configure proper firewall rules

## Support

For questions or issues:
1. Check logs in MongoDB for detailed error information
2. Verify database connections
3. Review migration script output
4. Contact the development team

## Next Steps

1. **Test all APIs** with the new hybrid setup
2. **Update frontend** if needed for new endpoints
3. **Monitor performance** and optimize queries
4. **Set up automated backups** for both databases
5. **Configure production deployment** pipelines
