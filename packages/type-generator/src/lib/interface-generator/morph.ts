import { Project }                    from 'ts-morph';
import { completeFiles }              from './complete-files';
import { ClassPool, createClassPool } from './create-class-pool';
import { createInterfaceFiles }       from './create-interface-files';
import { InterfaceGeneratorOptions }  from './types';

const chokidar = require('chokidar');

const defaultOptions: Partial<InterfaceGeneratorOptions> = {
  tsConfigFilePath: './tsconfig.base.json',
  skipAddingFilesFromTsConfig: false
};

export function startInterfaceGenerator(options: InterfaceGeneratorOptions) {
  console.log('[Interface Generator] Create initial files');

  let globalClassPool;
  globalClassPool = runInterfaceCreator(options, globalClassPool);

  const watcher = chokidar.watch(options.filePaths, { ignoreInitial: true })
                          .on('all', (eventName, path) => {
                            console.log('[Interface Generator] - Chokidar]', eventName, path);
                            if (!['add', 'update', 'change'].includes(eventName)) return;

                            const _options: InterfaceGeneratorOptions = { ...options, filePaths: [path] };
                            globalClassPool                           = runInterfaceCreator(_options, globalClassPool);
                          });

  console.log('[Interface Generator] Done - Watching...');
}

export function runInterfaceCreator(options: InterfaceGeneratorOptions, classPool: ClassPool): ClassPool {
  const project = new Project({ ...defaultOptions, ...options });

  const sourceFiles     = project.getSourceFiles(options.filePaths);
  const _classPool      = createClassPool(sourceFiles);
  const mergedClassPool = new Set([
      ...Array.from(classPool || []),
      ...Array.from(_classPool || [])
    ]
  );
  const interfaceFiles  = createInterfaceFiles(project, sourceFiles, mergedClassPool, options);

  completeFiles(interfaceFiles);
  project.saveSync();

  return mergedClassPool;
}

/**
 * Start interface generator
 */
startInterfaceGenerator({
  filePaths: [
    'apps/**/*.response.ts',
    'libs/**/*.response.ts',
    'apps/**/*.dtos.ts',
    'libs/**/*.dtos.ts',
    'apps/**/*.dto.ts',
    'libs/**/*.dto.ts',
    'libs/**/*.class.ts',
    'libs/**/*.model.ts',
  ],
  superclassReplaceCallback: (value: string): string => {
    let replaced = value.replace('UpdateDtoType(', 'IUpdateDtoType<');
    replaced     = replaced.replace(')', '>');

    return replaced;
  }
});
