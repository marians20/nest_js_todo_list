# NestJS To-Do List API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

A full-featured To-Do List REST API built with NestJS, TypeScript, SQLite, and comprehensive Swagger documentation. This project demonstrates modern NestJS development practices including repository pattern, dependency injection, and complete API documentation.

## 🚀 Features

### Core Functionality

- ✅ **Complete CRUD Operations** - Create, read, update, and delete todos
- ✅ **Advanced Filtering** - Filter by status, priority, and search by title
- ✅ **Due Date Management** - Track overdue items with automatic calculation
- ✅ **Priority Levels** - Support for low, medium, and high priority tasks
- ✅ **Status Management** - Pending, in-progress, and completed states

### Technical Features

- 🗃️ **SQLite Database** - Persistent storage with TypeORM integration
- 📚 **Repository Pattern** - Clean separation of concerns and testability
- 🔍 **Swagger/OpenAPI** - Interactive API documentation (like .NET Web API)
- 🧪 **Comprehensive Testing** - Unit tests with Jest framework
- 🎯 **Input Validation** - Request validation with class-validator
- 🏗️ **Clean Architecture** - Organized folder structure following NestJS best practices

### Additional Components

- 📐 **Geometric Utilities** - Point-in-polygon detection with ray casting algorithm
- 🔧 **Business Logic** - Entity methods for task management operations
- 🛡️ **Type Safety** - Full TypeScript implementation with strict typing

## 🏛️ Architecture

### Project Structure

```bash
src/
├── controllers/          # HTTP request handlers
│   ├── app.controller.ts
│   └── todo.controller.ts
├── services/            # Business logic layer
│   ├── app.service.ts
│   └── todo.service.ts
├── entities/            # TypeORM database entities
│   └── todo.entity.ts
├── repositories/        # Data access layer
│   ├── interfaces/
│   │   └── todo.repository.interface.ts
│   └── todo.repository.ts
├── dto/                 # Data Transfer Objects
│   └── todo.dto.ts
├── model/               # Domain models and utilities
│   ├── area.ts          # Geometric area with point detection
│   ├── area.spec.ts     # Comprehensive unit tests
│   └── point.ts         # 2D point representation
├── app.module.ts        # Main application module
└── main.ts             # Application bootstrap
```

### Design Patterns

- **Repository Pattern** - Abstract data access with interface-based design
- **Dependency Injection** - Clean separation and testability
- **DTO Pattern** - Request/response validation and transformation
- **Entity-Service-Controller** - Layered architecture

## 📋 API Endpoints

All endpoints are fully documented with Swagger/OpenAPI annotations:

### Todo Management

- `POST /todos` - Create a new todo item
- `GET /todos` - Get all todos (with optional filtering)
- `GET /todos/overdue` - Get overdue todo items
- `GET /todos/:id` - Get specific todo by ID
- `PATCH /todos/:id` - Update todo details
- `DELETE /todos/:id` - Delete todo item
- `PATCH /todos/:id/complete` - Mark todo as completed
- `PATCH /todos/:id/incomplete` - Mark todo as incomplete

### Query Parameters

- `status` - Filter by todo status (pending, in-progress, completed)
- `priority` - Filter by priority level (low, medium, high)
- `search` - Search todos by title (case-insensitive)

## 🛠️ Technology Stack

- **Framework**: NestJS 10.x with TypeScript
- **Database**: SQLite with TypeORM ORM
- **Documentation**: Swagger/OpenAPI with interactive UI
- **Validation**: class-validator and class-transformer
- **Testing**: Jest with comprehensive unit tests
- **Architecture**: Repository pattern with dependency injection

## 📦 Dependencies

### Core Dependencies

```json
{
  "@nestjs/core": "^10.0.0",
  "@nestjs/common": "^10.0.0",
  "@nestjs/typeorm": "^10.0.0",
  "@nestjs/swagger": "^7.0.0",
  "typeorm": "^0.3.17",
  "sqlite3": "^5.1.6",
  "class-validator": "^0.14.0",
  "class-transformer": "^0.5.1",
  "uuid": "^9.0.0"
}
```

## 🚀 Getting Started


### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd to-do-list
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the application**

   ```bash
   # Development mode with hot reload
   npm run start:dev
   
   # Production mode
   npm run start:prod
   ```

4. **Access the application**
   - API Server: <http://localhost:3000>
   - Swagger Documentation: <http://localhost:3000/api>

## 🧪 Testing

The project includes comprehensive unit tests with 100% coverage for critical components:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:cov

# Run end-to-end tests
npm run test:e2e
```

### Test Coverage
- ✅ **Area.containsPoint()** - 10 comprehensive test cases covering edge cases
- ✅ **Point-in-polygon algorithm** - Ray casting implementation validation
- ✅ **Business logic** - Entity methods and validation
- ✅ **Repository pattern** - Data access layer testing

## 📖 API Documentation

### Swagger UI
Visit http://localhost:3000/api after starting the application to access the interactive Swagger documentation. The API documentation includes:

- 📋 **Complete endpoint documentation** with request/response examples
- 🔍 **Try it out functionality** for testing endpoints directly
- 📝 **Schema definitions** for all DTOs and entities
- ⚡ **Real-time validation** of request parameters

### Example API Usage

#### Create a Todo
```bash
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn NestJS",
    "description": "Complete the todo list tutorial",
    "priority": "high",
    "dueDate": "2025-08-30T10:00:00Z"
  }'
```

#### Get All Todos with Filtering
```bash
# Get all pending todos
curl "http://localhost:3000/todos?status=pending"

# Get high priority todos
curl "http://localhost:3000/todos?priority=high"

# Search todos by title
curl "http://localhost:3000/todos?search=nestjs"
```

#### Get Overdue Todos
```bash
curl http://localhost:3000/todos/overdue
```

## 🗄️ Database

### SQLite Configuration
The application uses SQLite for persistent storage with the following features:

- **Auto-synchronization** - Database schema automatically created/updated
- **Entity relationships** - Proper foreign key constraints
- **Transaction support** - ACID compliance for data integrity
- **Migration ready** - Easy transition to other databases (PostgreSQL, MySQL)

### Database Schema
```sql
CREATE TABLE todo (
    id TEXT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    priority VARCHAR(10) DEFAULT 'medium',
    dueDate DATETIME,
    completedAt DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🏗️ Development Patterns

### Repository Pattern Implementation
```typescript
// Interface-based abstraction
interface ITodoRepository {
  create(todo: CreateTodoDto): Promise<TodoEntity>;
  findAll(filters?: TodoFilters): Promise<TodoEntity[]>;
  findById(id: string): Promise<TodoEntity>;
  update(id: string, updateData: UpdateTodoDto): Promise<TodoEntity>;
  delete(id: string): Promise<void>;
}

// Concrete implementation with TypeORM
@Injectable()
export class TodoRepository implements ITodoRepository {
  // Implementation details...
}
```

### Service Layer with Dependency Injection
```typescript
@Injectable()
export class TodoService {
  constructor(
    @Inject('ITodoRepository')
    private readonly todoRepository: ITodoRepository,
  ) {}
  
  // Business logic methods...
}
```

## 🔍 Special Features

### Geometric Utilities
The project includes a sophisticated point-in-polygon detection system:

```typescript
// Ray casting algorithm for point-in-area detection
const area = new Area([
  new Point(0, 0),
  new Point(10, 0),
  new Point(10, 10),
  new Point(0, 10)
]);

const isInside = area.containsPoint(new Point(5, 5)); // true
```

**Use Cases:**
- Geofencing for location-based todos
- Area-based task assignment
- Spatial filtering capabilities

## 🚀 Deployment

### Build for Production
```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Environment Configuration
Create `.env` file for environment-specific settings:
```env
NODE_ENV=production
PORT=3000
DATABASE_PATH=./database/todos.sqlite
LOG_LEVEL=info
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain test coverage above 80%
- Use conventional commit messages
- Update documentation for new features

## 📚 Learning Resources

This project demonstrates the following NestJS concepts:

- **Dependency Injection** - Service provider pattern
- **Decorators** - Controllers, services, and validation
- **Guards & Pipes** - Request validation and transformation
- **TypeORM Integration** - Database abstraction layer
- **Swagger Documentation** - API documentation best practices
- **Testing Strategies** - Unit and integration testing

## 📄 License

This project is [MIT licensed](LICENSE).

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - The progressive Node.js framework
- [TypeORM](https://typeorm.io/) - Database abstraction layer
- [Swagger](https://swagger.io/) - API documentation tools
- [Jest](https://jestjs.io/) - Testing framework
