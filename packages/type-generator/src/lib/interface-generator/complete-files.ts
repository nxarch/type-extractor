import { SourceFile } from 'ts-morph';

export function completeFiles(files: SourceFile[]): void {
  files.forEach(createdFile => {
    console.log('create', createdFile.getBaseName());
    createdFile.fixMissingImports();
    createdFile.formatText();
  });
}
