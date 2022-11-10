import { SourceFile } from 'ts-morph';

export type ClassPool = Set<string>

export function createClassPool(sourceFiles: SourceFile[]): ClassPool {
  // get pool of all classes
  const classPoolSet = new Set<string>();
  sourceFiles.forEach(async (file, index) => {
    const classes = file.getClasses();

    classes.forEach(cl => {
      classPoolSet.add(cl.getName());
    });
  });

  return classPoolSet;
}
