export interface InterfaceGeneratorOptions {
  filePaths: string[],
  superclassReplaceCallback?: SuperclassReplaceCallback,
  tsConfigFilePath?: string,
  skipAddingFilesFromTsConfig?: boolean
}


export type SuperclassReplaceCallback = (value: string) => string

