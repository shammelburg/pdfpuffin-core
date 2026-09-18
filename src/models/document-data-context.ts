import { DocumentDefinition } from "./document-definition.js";

export function documentDataContext(definition: DocumentDefinition): unknown {
  if (definition.dataSources?.length)
    return Object.fromEntries(
      definition.dataSources.flatMap((source) =>
        source.slug && source.slug !== source.id
          ? [
              [source.id, source.data],
              [source.slug, source.data],
            ]
          : [[source.id, source.data]],
      ),
    );
  return definition.data;
}
