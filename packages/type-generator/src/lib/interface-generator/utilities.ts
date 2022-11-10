import { toArray }                      from 'lodash';
import { ClassDeclaration, SourceFile } from 'ts-morph';
import { SuperclassReplaceCallback }    from './types';

/**
 * Helpers
 */
export function getSuperclassExtension(
  sourceClassDeclaration: ClassDeclaration,
  classPool: Set<string>,
  superclassReplaceCallback: SuperclassReplaceCallback
): string | null {
  const sourceExtension = sourceClassDeclaration.getExtends();
  if (!sourceExtension) return;

  const createPrefixedExtension = prefixTypes(sourceExtension.getText(), classPool);

  if (superclassReplaceCallback) {
    const replacedValue = superclassReplaceCallback(createPrefixedExtension);

    return replacedValue;
  }

  return createPrefixedExtension;
}

export function getTargetPath(file: SourceFile): boolean | null {
  let targetPath;
  file.getStatementsWithComments().forEach(comment => {
    if (comment?.getText().includes('**target=')) {
      targetPath = comment.getText().split('**target=')[1];
    }
  });

  return targetPath;
}

export function prefixTypes(typeString: string, classPool: Set<string>) {
  let array = typeString.split(' ');

  array = array.map(part => {
    if (isRuledOut(part)) return part;

    return replaceIfExists(part, classPool);
  });

  const interfaceStyleType = array.join(' ');

  return interfaceStyleType;
}

export function replaceIfExists(typing: string, pool: Set<string>): string {
  const _typeExists = typeExists(typing, pool);

  if (!_typeExists) {
    return typing;
  }

  const interfaceType = typing.replace(_typeExists.match, `I${_typeExists.match}`);

  return interfaceType;
}

export function typeExists(typing: string, pool: Set<string>): { match: string } | null {
  let exists       = null;
  const classArray = toArray(pool.values());

  for (let classType of classArray) {
    const className = classType.toString();
    const isMatch   = typing.includes(className);

    if (isMatch) {
      exists = { match: className };
      break;
    }
  }

  return exists;
}

export function isRuledOut(text: string): boolean {
  // todo add string, number, any, boolean, never, unknown, Date
  const format = /[`!@#$%^&*_+\-=;':"\\|,\/?~]/;

  return format.test(text);
}
