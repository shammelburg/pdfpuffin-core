import { DocumentDefinition } from './document-definition.js';

export function documentDataContext(definition: DocumentDefinition): unknown {
  if (definition.dataSources?.length) return Object.fromEntries(definition.dataSources.map((source) => [source.id, source.data]));
  return definition.data;
}
