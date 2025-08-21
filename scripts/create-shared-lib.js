#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function createSharedLib(libName) {
  if (!libName) {
    console.error('❌ Error: Library name is required');
    console.log('Usage: node scripts/create-shared-lib.js <library-name>');
    console.log('Example: node scripts/create-shared-lib.js networking');
    process.exit(1);
  }

  const projectName = `@shared/${libName}`;
  const projectRoot = `packages/@shared/${libName}`;

  console.log(`🚀 Creating shared library: ${projectName}`);

  // 1. Create directory structure
  const srcDir = path.join(projectRoot, 'src');
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
    console.log(`✅ Created directory: ${srcDir}`);
  }

  // 2. Create project.json
  const projectJson = {
    name: projectName,
    $schema: '../../../node_modules/nx/schemas/project-schema.json',
    sourceRoot: `${projectRoot}/src`,
    projectType: 'library',
    targets: {
      build: {
        executor: '@nx/js:tsc',
        outputs: ['{options.outputPath}'],
        options: {
          outputPath: `dist/${projectRoot}`,
          main: `${projectRoot}/src/index.ts`,
          tsConfig: `${projectRoot}/tsconfig.lib.json`,
        },
      },
      typecheck: {
        executor: '@nx/js:tsc',
        options: {
          tsConfig: `${projectRoot}/tsconfig.lib.json`,
          noEmit: true,
        },
      },
      lint: {
        executor: '@nx/eslint:lint',
      },
      test: {
        executor: '@nx/jest:jest',
        outputs: ['{workspaceRoot}/coverage/{projectRoot}'],
        options: {
          jestConfig: `${projectRoot}/jest.config.ts`,
        },
      },
    },
    tags: [],
  };

  fs.writeFileSync(
    path.join(projectRoot, 'project.json'),
    JSON.stringify(projectJson, null, 2)
  );
  console.log(`✅ Created: ${projectRoot}/project.json`);

  // 3. Create or update package.json
  const packageJsonPath = path.join(projectRoot, 'package.json');
  let packageJson;

  if (fs.existsSync(packageJsonPath)) {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    console.log(`✅ Updated existing: ${packageJsonPath}`);
  } else {
    packageJson = {
      name: projectName,
      version: '0.0.1',
      private: true,
      type: 'module',
    };
    console.log(`✅ Created: ${packageJsonPath}`);
  }

  // Update package.json configuration
  packageJson.main = './src/index.js';
  packageJson.module = './src/index.js';
  packageJson.types = './src/index.d.ts';
  packageJson.exports = {
    './package.json': './package.json',
    '.': {
      development: './src/index.ts',
      types: './src/index.d.ts',
      import: './src/index.js',
      default: './src/index.js',
    },
  };

  if (!packageJson.dependencies) {
    packageJson.dependencies = {};
  }
  packageJson.dependencies.tslib = '^2.3.0';

  if (!packageJson.devDependencies) {
    packageJson.devDependencies = {};
  }
  packageJson.devDependencies.typescript = '~5.9.2';

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  // 4. Create src/index.ts if it doesn't exist
  const indexPath = path.join(srcDir, 'index.ts');
  if (!fs.existsSync(indexPath)) {
    fs.writeFileSync(
      indexPath,
      `// ${projectName} library
export * from './lib';
`
    );
    console.log(`✅ Created: ${indexPath}`);
  }

  // 5. Create src/lib/index.ts
  const libDir = path.join(srcDir, 'lib');
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }

  const libIndexPath = path.join(libDir, 'index.ts');
  if (!fs.existsSync(libIndexPath)) {
    fs.writeFileSync(
      libIndexPath,
      `// Export your library functions here
export function hello${libName.charAt(0).toUpperCase() + libName.slice(1)}() {
  return 'Hello from ${projectName}!';
}
`
    );
    console.log(`✅ Created: ${libIndexPath}`);
  }

  // 6. Update app/package.json to include the new library
  const appPackageJsonPath = 'app/package.json';
  if (fs.existsSync(appPackageJsonPath)) {
    const appPackageJson = JSON.parse(fs.readFileSync(appPackageJsonPath, 'utf8'));
    
    if (!appPackageJson.devDependencies) {
      appPackageJson.devDependencies = {};
    }
    
    appPackageJson.devDependencies[projectName] = '*';
    
    fs.writeFileSync(appPackageJsonPath, JSON.stringify(appPackageJson, null, 2));
    console.log(`✅ Added ${projectName} to app dependencies`);
  }

  console.log('\n🎉 Shared library created successfully!');
  console.log('\nNext steps:');
  console.log(`1. Run: npm install`);
  console.log(`2. Import in your app: import { hello${libName.charAt(0).toUpperCase() + libName.slice(1)} } from '${projectName}';`);
  console.log(`3. Start development: ./start-dev.sh`);
}

// Get library name from command line arguments
const libName = process.argv[2];
createSharedLib(libName); 