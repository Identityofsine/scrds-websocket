import {
  Tree,
  formatFiles,
  names,
  readJson,
  writeJson,
} from '@nx/devkit';
import { SharedLibGeneratorSchema } from './schema';

interface NormalizedSchema extends SharedLibGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
}

export default async function (tree: Tree, options: SharedLibGeneratorSchema) {
  const normalizedOptions = normalizeOptions(tree, options);
  addProjectJson(tree, normalizedOptions);
  updatePackageJson(tree, normalizedOptions);
  addToAppDependencies(tree, normalizedOptions);
  
  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}

function normalizeOptions(tree: Tree, options: SharedLibGeneratorSchema): NormalizedSchema {
  const name = names(options.name).fileName;
  const projectDirectory = options.directory ? `${options.directory}/${name}` : name;
  const projectName = `@shared/${name}`;
  const projectRoot = `packages/@shared/${name}`;

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags: [],
  };
}

function addProjectJson(tree: Tree, options: NormalizedSchema) {
  const projectJson = {
    name: options.projectName,
    $schema: '../../../node_modules/nx/schemas/project-schema.json',
    sourceRoot: `${options.projectRoot}/src`,
    projectType: 'library',
    targets: {
      build: {
        executor: '@nx/js:tsc',
        outputs: ['{options.outputPath}'],
        options: {
          outputPath: `dist/${options.projectRoot}`,
          main: `${options.projectRoot}/src/index.ts`,
          tsConfig: `${options.projectRoot}/tsconfig.lib.json`,
        },
      },
      typecheck: {
        executor: '@nx/js:tsc',
        options: {
          tsConfig: `${options.projectRoot}/tsconfig.lib.json`,
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
          jestConfig: `${options.projectRoot}/jest.config.ts`,
        },
      },
    },
    tags: [],
  };

  writeJson(tree, `${options.projectRoot}/project.json`, projectJson);
}

function updatePackageJson(tree: Tree, options: NormalizedSchema) {
  const packageJsonPath = `${options.projectRoot}/package.json`;
  
  if (tree.exists(packageJsonPath)) {
    const packageJson = readJson(tree, packageJsonPath);
    
    // Update package.json configuration
    packageJson.main = './src/index.js';
    packageJson.module = './src/index.js';
    packageJson.types = './src/index.d.ts';
    
    // Ensure devDependencies exist
    if (!packageJson.devDependencies) {
      packageJson.devDependencies = {};
    }
    
    // Add TypeScript as devDependency
    packageJson.devDependencies.typescript = '~5.9.2';
    
    writeJson(tree, packageJsonPath, packageJson);
  }
}

function addToAppDependencies(tree: Tree, options: NormalizedSchema) {
  const appPackageJsonPath = 'app/package.json';
  
  if (tree.exists(appPackageJsonPath)) {
    const appPackageJson = readJson(tree, appPackageJsonPath);
    
    // Ensure devDependencies exist
    if (!appPackageJson.devDependencies) {
      appPackageJson.devDependencies = {};
    }
    
    // Add the shared library as a dependency
    appPackageJson.devDependencies[options.projectName] = '*';
    
    writeJson(tree, appPackageJsonPath, appPackageJson);
  }
} 