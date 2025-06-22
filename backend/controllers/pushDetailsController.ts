import { Request } from "express";
import { getCluster } from "../db/couchbase.js";
import { encryptAES } from "../utils/encryptionUtils.js";
import { QueryScanConsistency } from "couchbase";

const bucketName = "appian";
const scopeName = "user";
const collectionName = "document";

export const handlePushDetails = async (req: Request): Promise<{ status: number; body: any }> => {
  try {
    const { document_type, named_entities } = req.body;

    if (!named_entities?.Name) {
      return { status: 400, body: { error: "Named entity 'Name' is required" } };
    }

    const cluster = getCluster();
    const name: string = named_entities.Name;

    const query = `
      SELECT META().id, document_type, named_entities
      FROM \`${bucketName}\`.\`${scopeName}\`.\`${collectionName}\`
      WHERE name = $name
      LIMIT 1;
    `;

    const result = await cluster.query(query, { parameters: { name }, scanConsistency: QueryScanConsistency.RequestPlus });

    const encryptedEntities: Record<string, any> = {};
    for (const [key, value] of Object.entries(named_entities)) {
      if (value) encryptedEntities[key] = encryptAES(value as string);
    }

    if (result.rows.length > 0) {
      const existing = result.rows[0];
      const docId = existing.id;
      const currentTypes: string[] = existing.document_type;
      const updatedTypes = currentTypes.includes(document_type)
        ? currentTypes
        : [...currentTypes, document_type];

      const updateQuery = `
        UPDATE \`${bucketName}\`.\`${scopeName}\`.\`${collectionName}\`
        USE KEYS $docId
        SET document_type = $types,
            named_entities = $entities;
      `;

      await cluster.query(updateQuery, {
        parameters: {
          docId,
          types: updatedTypes,
          entities: encryptedEntities,
        },
      });

      return { status: 200, body: { message: "Document updated successfully" } };
    } else {
      const newDoc = {
        name,
        document_type: [document_type],
        named_entities: encryptedEntities,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const insertId = `document::${name}`;
      const insertQuery = `
        INSERT INTO \`${bucketName}\`.\`${scopeName}\`.\`${collectionName}\`
        (KEY, VALUE) VALUES ($id, $doc);
      `;

      await cluster.query(insertQuery, {
        parameters: {
          id: insertId,
          doc: newDoc,
        },
      });

      return { status: 201, body: { message: "Document created successfully" } };
    }
  } catch (error) {
    console.error("Error processing document data:", error);
    return { status: 500, body: { error: "Failed to process document data" } };
  }
};
