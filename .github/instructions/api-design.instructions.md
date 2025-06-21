---
applyTo: '**'
---

# API Design Guidelines

## REST API Principles

### Resource-Based URLs

Use nouns, not verbs, and represent resources in a hierarchical manner:

```
✅ Good
GET    /api/users              # Get all users
GET    /api/users/123          # Get user by ID
POST   /api/users              # Create new user
PUT    /api/users/123          # Update user completely
PATCH  /api/users/123          # Update user partially
DELETE /api/users/123          # Delete user

GET    /api/users/123/orders   # Get orders for user
POST   /api/users/123/orders   # Create order for user

❌ Bad
GET    /api/getUsers
POST   /api/createUser
GET    /api/user_orders/123
```

### HTTP Methods

Use appropriate HTTP methods for different operations:

- **GET** - Retrieve data (idempotent, no side effects)
- **POST** - Create new resources or non-idempotent operations
- **PUT** - Replace entire resource (idempotent)
- **PATCH** - Partial update (may or may not be idempotent)
- **DELETE** - Remove resource (idempotent)

### Status Codes

Use standard HTTP status codes consistently:

```typescript
// Success
200 OK           - Successful GET, PUT, PATCH
201 Created      - Successful POST
204 No Content   - Successful DELETE

// Client Errors
400 Bad Request  - Invalid request data
401 Unauthorized - Authentication required
403 Forbidden    - Access denied
404 Not Found    - Resource doesn't exist
409 Conflict     - Resource already exists or conflict
422 Unprocessable Entity - Validation errors

// Server Errors
500 Internal Server Error - Unexpected server error
502 Bad Gateway          - Upstream service error
503 Service Unavailable  - Service temporarily down
```

## NestJS API Implementation

### Controller Structure

```typescript
@Controller("users")
@ApiTags("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: "Get all users" })
  @ApiResponse({ status: 200, description: "Users retrieved successfully" })
  async findAll(
    @Query() query: PaginationDto
  ): Promise<PaginatedResponse<User>> {
    return this.usersService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by ID" })
  @ApiParam({ name: "id", description: "User ID" })
  @ApiResponse({ status: 200, description: "User found" })
  @ApiResponse({ status: 404, description: "User not found" })
  async findOne(@Param("id") id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create new user" })
  @ApiResponse({ status: 201, description: "User created successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update user completely" })
  async update(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete user" })
  @ApiResponse({ status: 204, description: "User deleted successfully" })
  async remove(@Param("id") id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
```

### Data Transfer Objects (DTOs)

```typescript
import { IsEmail, IsString, MinLength, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({ description: "User full name", example: "John Doe" })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: "User email address",
    example: "john@example.com",
  })
  @IsEmail()
  email: string;

  @ApiProperty({ description: "User password", minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ description: "User profile picture URL" })
  @IsOptional()
  @IsString()
  profilePicture?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profilePicture?: string;
}
```

## Response Formats

### Success Response Structure

```typescript
// Single resource
{
  "data": {
    "id": "123",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2023-01-01T00:00:00Z"
  },
  "message": "User retrieved successfully"
}

// Multiple resources with pagination
{
  "data": [
    {
      "id": "123",
      "name": "John Doe",
      "email": "john@example.com"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  },
  "message": "Users retrieved successfully"
}
```

### Error Response Structure

```typescript
// Validation error
{
  "error": "Validation failed",
  "message": "Input validation failed",
  "statusCode": 400,
  "details": [
    {
      "field": "email",
      "message": "must be a valid email"
    },
    {
      "field": "password",
      "message": "must be at least 8 characters"
    }
  ],
  "timestamp": "2023-01-01T00:00:00Z",
  "path": "/api/users"
}

// Generic error
{
  "error": "Resource not found",
  "message": "User with ID 123 not found",
  "statusCode": 404,
  "timestamp": "2023-01-01T00:00:00Z",
  "path": "/api/users/123"
}
```

### Response Interfaces

```typescript
export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  details?: ValidationError[];
  timestamp: string;
  path: string;
}
```

## Pagination and Filtering

### Pagination Parameters

```typescript
export class PaginationDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: "Sort field" })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ["asc", "desc"], default: "asc" })
  @IsOptional()
  @IsIn(["asc", "desc"])
  sortOrder?: "asc" | "desc" = "asc";
}
```

### Filtering Implementation

```typescript
export class UserFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: "Filter by name" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: "Filter by email" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: "Filter by role" })
  @IsOptional()
  @IsIn(["admin", "user", "moderator"])
  role?: string;

  @ApiPropertyOptional({ description: "Filter by creation date (from)" })
  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @ApiPropertyOptional({ description: "Filter by creation date (to)" })
  @IsOptional()
  @IsDateString()
  createdTo?: string;
}
```

## Authentication and Authorization

### JWT Authentication

```typescript
@Controller("auth")
export class AuthController {
  @Post("login")
  @ApiOperation({ summary: "User login" })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @Post("refresh")
  @ApiOperation({ summary: "Refresh access token" })
  @ApiBearerAuth()
  async refresh(@Req() req: Request): Promise<AuthResponse> {
    return this.authService.refresh(req.user.id);
  }
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}
```

### Authorization Guards

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}

// Usage
@Get('admin')
@Roles(Role.Admin)
@UseGuards(JwtAuthGuard, RolesGuard)
async getAdminData(): Promise<any> {
  return this.adminService.getData();
}
```

## File Upload Handling

### Single File Upload

```typescript
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
@ApiConsumes('multipart/form-data')
@ApiBody({
  description: 'File upload',
  type: 'multipart/form-data',
  schema: {
    type: 'object',
    properties: {
      file: {
        type: 'string',
        format: 'binary',
      },
    },
  },
})
async uploadFile(
  @UploadedFile() file: Express.Multer.File,
): Promise<UploadResponse> {
  return this.fileService.uploadFile(file);
}
```

### Multiple File Upload

```typescript
@Post('upload-multiple')
@UseInterceptors(FilesInterceptor('files', 10))
async uploadFiles(
  @UploadedFiles() files: Express.Multer.File[],
): Promise<UploadResponse[]> {
  return this.fileService.uploadFiles(files);
}
```

## Error Handling

### Global Exception Filter

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    let error = "Internal Server Error";
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "object") {
        error = (exceptionResponse as any).error || error;
        message = (exceptionResponse as any).message || message;
        details = (exceptionResponse as any).details;
      } else {
        message = exceptionResponse;
      }
    }

    const errorResponse: ErrorResponse = {
      error,
      message,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(details && { details }),
    };

    this.logger.error(
      `${request.method} ${request.url}`,
      JSON.stringify(errorResponse)
    );

    response.status(status).json(errorResponse);
  }
}
```

## API Versioning

### URL Versioning

```typescript
@Controller({ path: "users", version: "1" })
export class UsersV1Controller {
  // Version 1 implementation
}

@Controller({ path: "users", version: "2" })
export class UsersV2Controller {
  // Version 2 implementation
}
```

### Header Versioning

```typescript
// main.ts
app.enableVersioning({
  type: VersioningType.HEADER,
  header: "API-Version",
});
```

## Rate Limiting

### Rate Limiting Configuration

```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60, // Time to live in seconds
      limit: 100, // Maximum number of requests within TTL
    }),
  ],
})
export class AppModule {}

// Apply to specific endpoints
@Throttle(10, 60) // 10 requests per minute
@Post('login')
async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
  return this.authService.login(loginDto);
}
```

## API Documentation

### Swagger Configuration

```typescript
// main.ts
const config = new DocumentBuilder()
  .setTitle("API Documentation")
  .setDescription("Comprehensive API documentation")
  .setVersion("1.0")
  .addBearerAuth()
  .addTag("users", "User management operations")
  .addTag("auth", "Authentication operations")
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup("api/docs", app, document);
```

### Comprehensive API Examples

```typescript
@ApiOperation({
  summary: 'Create new user',
  description: 'Creates a new user account with the provided information',
})
@ApiResponse({
  status: 201,
  description: 'User created successfully',
  schema: {
    example: {
      data: {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: '2023-01-01T00:00:00Z',
      },
      message: 'User created successfully',
    },
  },
})
@ApiResponse({
  status: 400,
  description: 'Validation failed',
  schema: {
    example: {
      error: 'Validation failed',
      message: 'Input validation failed',
      statusCode: 400,
      details: [
        {
          field: 'email',
          message: 'must be a valid email',
        },
      ],
    },
  },
})
async create(@Body() createUserDto: CreateUserDto): Promise<ApiResponse<User>> {
  return this.usersService.create(createUserDto);
}
```

## Performance Optimization

### Database Query Optimization

```typescript
// Use select to limit fields
const users = await this.userRepository.find({
  select: ["id", "name", "email"],
  where: { isActive: true },
  order: { createdAt: "DESC" },
  take: 10,
  skip: 0,
});

// Use joins for related data
const usersWithProfiles = await this.userRepository.find({
  relations: ["profile"],
  where: { isActive: true },
});
```

### Caching Strategy

```typescript
@Injectable()
export class UsersService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async findOne(id: string): Promise<User> {
    const cacheKey = `user:${id}`;
    let user = await this.cacheManager.get<User>(cacheKey);

    if (!user) {
      user = await this.userRepository.findOne({ where: { id } });
      if (user) {
        await this.cacheManager.set(cacheKey, user, 300); // 5 minutes
      }
    }

    return user;
  }
}
```

## Testing API Endpoints

### Controller Testing

```typescript
describe("UsersController", () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  describe("create", () => {
    it("should create a user", async () => {
      const createUserDto: CreateUserDto = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      const expectedResult = { id: "1", ...createUserDto };
      jest.spyOn(service, "create").mockResolvedValue(expectedResult as User);

      const result = await controller.create(createUserDto);
      expect(result).toBe(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });
});
```

These API design guidelines ensure consistency, maintainability, and developer experience across all backend services.
