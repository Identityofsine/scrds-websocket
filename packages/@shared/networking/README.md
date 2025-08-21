# @shared/networking

A shared library for the SRCDS WebSocket application.

## Installation

This library is automatically linked via the workspace configuration. It's available as `@shared/networking` in the workspace.

## Usage

```typescript
import { Networking } from '@shared/networking';

const networking = new Networking();
console.log(networking.hello());
```

## API

### Networking

The main class for this shared library.

#### Methods

- `hello()`: Example method that returns a greeting message

## Development

This library is part of the SRCDS WebSocket monorepo and follows the shared library pattern with proper project.json configuration to avoid TypeScript external dependency issues.

### Building

```bash
nx build @shared/networking
```

### Testing

```bash
nx test @shared/networking
```

### Linting

```bash
nx lint @shared/networking
``` 