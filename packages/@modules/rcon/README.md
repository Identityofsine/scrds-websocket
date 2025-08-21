# @modules/rcon

A shared library for the SRCDS WebSocket application.

## Installation

This library is automatically linked via the workspace configuration. It's available as `@modules/rcon` in the workspace.

## Usage

```typescript
import { Rcon } from '@modules/rcon';

const rcon = new Rcon();
console.log(rcon.hello());
```

## API

### Rcon

The main class for this shared library.

#### Methods

- `hello()`: Example method that returns a greeting message

## Development

This library is part of the SRCDS WebSocket monorepo and follows the shared library pattern with proper project.json configuration to avoid TypeScript external dependency issues.

### Building

```bash
nx build @modules/rcon
```

### Testing

```bash
nx test @modules/rcon
```

### Linting

```bash
nx lint @modules/rcon
``` 