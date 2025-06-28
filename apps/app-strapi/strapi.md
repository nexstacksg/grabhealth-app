# Strapi Development Guidelines

## Important: Maintaining Stability

To avoid cache issues and maintain a stable development environment, follow these guidelines:

## 1. Use Strapi's Built-in Tools

### Content Type Builder (Recommended)
- Always use the Admin UI Content-Type Builder when possible
- Access at: http://localhost:1337/admin
- This automatically handles file generation, database sync, and permissions
- No cache clearing required

### Strapi CLI for API Generation
```bash
# Generate a new API with full CRUD operations
bun run strapi generate

# Select:
# - api - Generate a basic API
# - Enter API name (e.g., "blog-post")
# - Strapi creates all necessary files with proper structure
```

## 2. Development Workflow

### Starting Development
```bash
# Always use develop mode for development
bun run develop

# Only use build for production
bun run build
```

### When to Restart Strapi
- After modifying content type schemas
- After adding new routes
- After changing configuration files
- NO need to delete cache or node_modules

### Handling Vite Errors
Only if you see Vite optimization errors:
```bash
# Clean cache directories
rm -rf node_modules/.strapi
rm -rf .cache
rm -rf .strapi
rm -rf dist
rm -rf build

# Rebuild
bun run build
```

## 3. Custom Routes Best Practices

### File Structure
```
src/api/[api-name]/
├── routes/
│   ├── [api-name].ts        # Default CRUD routes (don't modify)
│   └── 01-custom-[api-name].ts  # Your custom routes
```

### Custom Route Example
```javascript
// src/api/partner/routes/01-custom-partner.ts
export default {
  routes: [
    {
      method: 'GET',
      path: '/partners/:id/custom-endpoint',
      handler: 'partner.customMethod',
      config: {
        policies: [],
        middlewares: [],
        // auth: false, // Only if you want public access
      },
    },
  ],
};
```

### Custom Controller Method
```javascript
// In the controller file
async customMethod(ctx) {
  try {
    const { id } = ctx.params;
    // Your logic here
    return { data: result };
  } catch (error) {
    return ctx.internalServerError('Error message');
  }
}
```

## 4. Permissions Management

### Through Admin UI (Recommended)
1. Go to Settings → Users & Permissions → Roles
2. Select the role (Public, Authenticated, etc.)
3. Find your API and check the permissions
4. Save

### Through Code (Use Sparingly)
Only use bootstrap for initial setup, not for every permission:
```javascript
// src/index.ts - bootstrap function
// Only for core permissions that should always exist
```

## 5. Common Pitfalls to Avoid

### DON'T:
- ❌ Modify core Strapi files
- ❌ Use reserved words like 'status' in schemas
- ❌ Edit generated route files directly
- ❌ Clear cache/node_modules unless absolutely necessary
- ❌ Mix different ID types (numeric vs documentId)

### DO:
- ✅ Use Content-Type Builder for schema changes
- ✅ Create separate files for custom routes
- ✅ Use Strapi Entity Service API
- ✅ Set permissions through Admin UI
- ✅ Keep development server running with `develop`

## 6. Database Schema Guidelines

### Field Naming
```javascript
// Good - Avoid reserved words
bookingStatus: { type: 'enumeration' }  // Instead of 'status'
isActive: { type: 'boolean' }          // Instead of 'active'
userName: { type: 'string' }           // Instead of 'user'

// Bad - Reserved words
status: { type: 'enumeration' }  // Reserved word
user: { type: 'string' }         // Conflicts with relations
```

### Relations
Always define both sides of relations properly in the Content-Type Builder

## 7. Debugging Tips

### Check Strapi Logs
```bash
# Development logs are verbose and helpful
bun run develop
```

### API Testing
Use Strapi's built-in API documentation:
- http://localhost:1337/documentation

### Database Issues
```bash
# Check database schema
bun run strapi console
> strapi.db.connection.raw('SELECT * FROM information_schema.tables')
```

## 8. Production Considerations

### Building for Production
```bash
# Clean build
rm -rf build dist
bun run build
bun run start
```

### Environment Variables
Always use `.env` for configuration, never hardcode

## Quick Reference

### Most Common Commands
```bash
bun run develop              # Start development server
bun run strapi generate      # Generate new API
bun run strapi console      # Interactive console
```

### File Structure
```
src/api/[name]/
├── content-types/
│   └── [name]/
│       └── schema.json     # Content type definition
├── controllers/
│   └── [name].ts          # Business logic
├── routes/
│   └── [name].ts          # Default routes (don't edit)
│   └── 01-custom.ts       # Custom routes
└── services/
    └── [name].ts          # Reusable service logic
```

Remember: When in doubt, use the Admin UI!