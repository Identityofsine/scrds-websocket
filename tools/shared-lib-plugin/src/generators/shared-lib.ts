import {
  formatFiles,
  generateFiles,
  installPackagesTask,
  names,
  readJson,
  Tree,
  writeJson,
} from '@nx/devkit';
import * as path from 'path';
import { SharedLibGeneratorSchema } from './schema';

interface NormalizedSchema extends SharedLibGeneratorSchema {
  projectName: string;
  projectRoot: string;
  fileName: string;
  namespace: string;
  directory: string;
}

export async function sharedLibGenerator(tree: Tree, options: SharedLibGeneratorSchema) {
  const normalizedOptions = normalizeOptions(options);
  
  addProjectJson(tree, normalizedOptions);
  addPackageJson(tree, normalizedOptions);
  addSourceFiles(tree, normalizedOptions);
  addTsConfig(tree, normalizedOptions);
  addToAppDependencies(tree, normalizedOptions);
  addToAppTsConfigReferences(tree, normalizedOptions);
  
  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  // Return a task to install packages after file generation is complete
  return () => {
    installPackagesTask(tree);
  };
}

function normalizeOptions(options: SharedLibGeneratorSchema): NormalizedSchema {
  const fileName = names(options.name).fileName;
  
  // Determine the namespace
  let namespace = options.namespace;
  if (!namespace && options.directory) {
    // Auto-detect namespace from directory
    const dirParts = options.directory.split('/');
    const lastPart = dirParts[dirParts.length - 1];
    if (lastPart.startsWith('@')) {
      namespace = lastPart;
    }
  }
  if (!namespace) {
    namespace = '@shared'; // Default fallback
  }
  
  // Determine project name
  const projectName = namespace ? `${namespace}/${fileName}` : fileName;
  
  // Determine project root
  const directory = options.directory || 'packages/@shared';
  const projectRoot = `${directory}/${fileName}`;

  return {
    ...options,
    projectName,
    projectRoot,
    fileName,
    namespace,
    directory,
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

function addPackageJson(tree: Tree, options: NormalizedSchema) {
  const packageJson = {
    name: options.projectName,
    version: '0.0.1',
    private: true,
    type: 'module',
    main: './src/index.js',
    module: './src/index.js',
    types: './src/index.d.ts',
    exports: {
      './package.json': './package.json',
      '.': {
        development: './src/index.ts',
        types: './dist/index.d.ts',
        import: './dist/index.js',
        default: './dist/index.js',
      },
    },
    dependencies: {
      tslib: '^2.3.0',
    },
    devDependencies: {
      typescript: '~5.9.2',
    },
  };

  writeJson(tree, `${options.projectRoot}/package.json`, packageJson);
}

function addSourceFiles(tree: Tree, options: NormalizedSchema) {
  const nameUtils = names(options.name);
  const templateOptions = {
    ...options,
    names: nameUtils,
    fileName: nameUtils.fileName,
    template: '',
  };

  generateFiles(
    tree, 
    path.join(__dirname, 'files'), 
    options.projectRoot, 
    templateOptions
  );
}

function addTsConfig(tree: Tree, options: NormalizedSchema) {
  // tsconfig.lib.json - copy from existing working packages
  const tsConfigLib = {
    extends: '../../../tsconfig.base.json',
    compilerOptions: {
      baseUrl: '.',
      rootDir: 'src',
      outDir: 'dist',
      tsBuildInfoFile: 'dist/tsconfig.lib.tsbuildinfo',
      emitDeclarationOnly: false,
      forceConsistentCasingInFileNames: true,
      types: ['node'],
    },
    include: ['src/**/*.ts'],
    references: [],
    exclude: [
      'jest.config.ts',
      'src/**/*.spec.ts',
      'src/**/*.test.ts',
    ],
  };

  writeJson(tree, `${options.projectRoot}/tsconfig.lib.json`, tsConfigLib);

  // tsconfig.spec.json - copy from existing working packages
  const tsConfigSpec = {
    extends: '../../../tsconfig.base.json',
    compilerOptions: {
      outDir: './out-tsc/jest',
      types: ['jest', 'node'],
      forceConsistentCasingInFileNames: true,
    },
    include: [
      'jest.config.ts',
      'src/**/*.test.ts',
      'src/**/*.spec.ts',
      'src/**/*.d.ts',
    ],
    references: [
      {
        path: './tsconfig.lib.json',
      },
    ],
  };

  writeJson(tree, `${options.projectRoot}/tsconfig.spec.json`, tsConfigSpec);

  // tsconfig.json - copy from existing working packages
  const tsConfig = {
    extends: '../../../tsconfig.base.json',
    files: [],
    include: [],
    references: [
      {
        path: './tsconfig.lib.json',
      },
      {
        path: './tsconfig.spec.json',
      },
    ],
  };

  writeJson(tree, `${options.projectRoot}/tsconfig.json`, tsConfig);
}

function addToAppDependencies(tree: Tree, options: NormalizedSchema) {
  const appPackageJsonPath = 'app/package.json';
  
  if (tree.exists(appPackageJsonPath)) {
    const appPackageJson = readJson(tree, appPackageJsonPath);
    
    if (!appPackageJson.devDependencies) {
      appPackageJson.devDependencies = {};
    }
    
    appPackageJson.devDependencies[options.projectName] = '*';
    
    writeJson(tree, appPackageJsonPath, appPackageJson);
  }
}

function addToAppTsConfigReferences(tree: Tree, options: NormalizedSchema) {
  const appTsConfigPath = 'app/tsconfig.app.json';
  
  if (tree.exists(appTsConfigPath)) {
    const appTsConfig = readJson(tree, appTsConfigPath);
    
    if (!appTsConfig.references) {
      appTsConfig.references = [];
    }
    
    const newReference = {
      path: `../${options.projectRoot}/tsconfig.lib.json`
    };
    
    // Check if reference already exists
    const existingRef = appTsConfig.references.find((ref: any) => 
      ref.path === newReference.path
    );
    
    if (!existingRef) {
      appTsConfig.references.push(newReference);
      writeJson(tree, appTsConfigPath, appTsConfig);
    }
  }
}

export default sharedLibGenerator;
