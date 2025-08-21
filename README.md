# SRCDS WebSocket

A TypeScript monorepo for Source Dedicated Server (SRCDS) WebSocket communication using Nx workspace.

## 🚀 Quick Start

### Development Environment

```bash
# Start development with hot reloading
./start-dev.sh

# Or manually
nx run app:serve:development --watch --verbose
```

This will:
- Build all shared libraries (`@shared/packets`, `@shared/utils`)
- Start the main application with hot reloading
- Watch for changes in shared libraries and rebuild automatically

### Project Structure

```
srcds-websocket/
├── app/                           # Main application
│   ├── src/main.ts               # Application entry point
│   └── package.json              # App dependencies
├── packages/@shared/             # Shared libraries
│   ├── packets/                  # Packet handling library
│   │   ├── src/
│   │   ├── project.json         # Nx build configuration
│   │   └── package.json
│   └── utils/                   # Utility functions library
│       ├── src/
│       ├── project.json         # Nx build configuration
│       └── package.json
├── tools/generators/            # Custom Nx generators
└── start-dev.sh                # Development script
```

## 📦 Creating Shared Libraries

### Using the Custom Generator (Recommended)

We've created a custom Nx generator that automatically sets up shared libraries with proper configuration:

```bash
# Create a new shared library
nx generate @srcds-socket/source:shared-lib <library-name>

# Example: Create a networking library
nx generate @srcds-socket/source:shared-lib networking

# Interactive mode (will prompt for library name)
nx generate @srcds-socket/source:shared-lib
```

**What the generator does automatically:**

✅ Creates `project.json` with proper build targets  
✅ Configures TypeScript compilation settings  
✅ Sets up package.json with correct paths  
✅ Adds TypeScript as devDependency  
✅ Links the library to the main app  
✅ Ensures proper workspace configuration  

### Manual Setup (Not Recommended)

If you need to manually create a shared library:

1. **Create the library structure:**
   ```bash
   mkdir -p packages/@shared/your-lib/src
   ```

2. **Create `project.json`:**
   ```json
   {
     "name": "@shared/your-lib",
     "$schema": "../../../node_modules/nx/schemas/project-schema.json",
     "sourceRoot": "packages/@shared/your-lib/src",
     "projectType": "library",
     "targets": {
       "build": {
         "executor": "@nx/js:tsc",
         "outputs": ["{options.outputPath}"],
         "options": {
           "outputPath": "dist/packages/@shared/your-lib",
           "main": "packages/@shared/your-lib/src/index.ts",
           "tsConfig": "packages/@shared/your-lib/tsconfig.lib.json"
         }
       }
     }
   }
   ```

3. **Update app dependencies:**
   ```json
   // app/package.json
   {
     "devDependencies": {
       "@shared/your-lib": "*"
     }
   }
   ```

## 🔧 Technical Notes

### TypeScript External Dependency Fix

We solved the common Nx issue: `The externalDependency 'typescript' for '@shared/packages:build' could not be found`

**Solution:** Explicit `project.json` configuration instead of relying on Nx inferred targets.

### Workspace Configuration

```json
// package.json
{
  "workspaces": [
    "app", 
    "packages/*/*"
  ]
}
```

This pattern properly recognizes the `@shared/*` namespace libraries.

### Hot Reloading

The development environment supports hot reloading for:
- Main application code changes
- Shared library changes (automatically rebuilds dependencies)
- TypeScript compilation errors are shown in real-time

## 🛠 Available Scripts

```bash
# Development
./start-dev.sh                    # Start with hot reloading
nx serve app                      # Basic serve
nx serve app:development          # Development mode

# Building
nx build app                      # Build main app
nx build @shared/packets          # Build specific library
nx run-many --target=build        # Build all projects

# Testing & Linting
nx test @shared/packets           # Run tests
nx lint @shared/packets           # Run linter
nx run-many --target=test         # Test all projects

# Utilities
nx reset                          # Clear Nx cache
nx graph                          # Show dependency graph
```

## 📚 Library Usage Examples

### Importing Shared Libraries

```typescript
// app/src/main.ts
import { BasePacket } from '@shared/packets';
import { mapArrayBuffer } from '@shared/utils';

const packet = new BasePacket();
const bytes = packet.toBytes();
console.log(bytes);
```

### Creating Packet Fields

```typescript
// Example: Using the packet field system
import { Unsigned32BitPacketField } from '@shared/packets';

const field = new Unsigned32BitPacketField(42);
const bytes = field.toBytes(); // ArrayBuffer representation
```

## 🏗 Architecture

### Dependency Flow

```
app
├── @shared/packets
│   └── @shared/utils (if needed)
└── @shared/utils
```

### Build Process

1. **Shared libraries build first** (`@shared/packets`, `@shared/utils`)
2. **App builds** with compiled library references
3. **Hot reloading** rebuilds only changed libraries + app

## 🚨 Troubleshooting

### Common Issues

**"External dependency 'typescript' could not be found"**
- Ensure each shared library has a `project.json` file
- Use our generator: `nx generate @srcds-socket/source:shared-lib`

**Hot reloading not working for libraries**
- Check that `runBuildTargetDependencies: true` in app's serve target
- Ensure proper `dependsOn: ["^build"]` in app's build target

**Import errors**
- Verify workspace configuration in root `package.json`
- Check that shared library is listed in app's `devDependencies`
- Run `npm install` after adding new libraries

### Reset Everything

```bash
rm -rf node_modules package-lock.json dist .nx
npm install
nx reset
```

## 🤝 Contributing

1. Use the generator for new shared libraries
2. Follow the existing project structure
3. Ensure hot reloading works after changes
4. Test both development and production builds

---

## Generator Schema Reference

The custom `shared-lib` generator accepts these options:

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `name` | string | Library name (e.g., 'networking') | Required |
| `directory` | string | Directory where library is placed | `packages/@shared` |
| `skipFormat` | boolean | Skip formatting files | `false` |

**Example:**
```bash
nx generate @srcds-socket/source:shared-lib networking --directory=packages/@shared
```
