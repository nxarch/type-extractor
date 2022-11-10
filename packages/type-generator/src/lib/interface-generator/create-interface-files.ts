import { Project, SourceFile }                                from 'ts-morph';
import { ClassPool }                                          from './create-class-pool';
import { InterfaceGeneratorOptions }                          from './types';
import { getSuperclassExtension, getTargetPath, prefixTypes } from './utilities';

export function createInterfaceFiles(
  project: Project,
  sourceFiles: SourceFile[],
  classPool: ClassPool,
  options: InterfaceGeneratorOptions
): SourceFile[] {
  const createdFiles: SourceFile[] = [];

  sourceFiles.forEach(async (file, index) => {
    const typeFileName = file.getBaseNameWithoutExtension() + '.type' + file.getExtension();

    const targetPath = getTargetPath(file);
    if (!targetPath) return;

    const classes     = file.getClasses();
    const createdFile = project.createSourceFile(targetPath + '/' + typeFileName, '', { overwrite: true });
    createdFiles.push(createdFile);

    classes.forEach(cl => {
      const _interface = cl.extractInterface(`I${cl.getName()}`);

      const extension = getSuperclassExtension(cl, classPool, options.superclassReplaceCallback);
      if (extension) {
        _interface.extends = (writer) => writer.write(extension);
      }

      // prefix properties if of class type
      _interface.properties.forEach(property => {
        const interfaceType = prefixTypes(property.type as string, classPool);
        property.type       = interfaceType;
      });

      const interfaceDeclaration = createdFile.addInterface(_interface);
      interfaceDeclaration.setIsExported(true);
    });
  });

  return createdFiles;
}
