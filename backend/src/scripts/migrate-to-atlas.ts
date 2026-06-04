import mongoose from 'mongoose';
import { configureDnsForAtlas } from '../config/database';
import { env } from '../config/env';

const sourceUrl = process.env.MIGRATION_SOURCE_URL ?? 'mongodb://localhost:27017/progloss';
const destinationUrl = process.env.MIGRATION_DESTINATION_URL ?? env.MONGO_URL;

function isSystemCollection(collectionName: string) {
  return collectionName.startsWith('system.');
}

async function copyCollection(collectionName: string, sourceDb: mongoose.Connection['db'], destinationDb: mongoose.Connection['db']) {
  if (!sourceDb || !destinationDb) {
    throw new Error('Database connection is not ready');
  }

  const sourceCollection = sourceDb.collection(collectionName);
  const destinationCollection = destinationDb.collection(collectionName);
  const documents = await sourceCollection.find({}).toArray();

  await destinationCollection.deleteMany({});

  if (documents.length > 0) {
    await destinationCollection.insertMany(documents, { ordered: false });
  }

  const sourceIndexes = await sourceCollection.indexes();
  const customIndexes = sourceIndexes.filter((index) => index.name !== '_id_');

  if (customIndexes.length > 0) {
    await destinationCollection.dropIndexes().catch(() => undefined);
    await destinationCollection.createIndexes(customIndexes);
  }

  return {
    collectionName,
    documentsCopied: documents.length,
    indexesCopied: customIndexes.length
  };
}

async function main() {
  configureDnsForAtlas(sourceUrl);
  configureDnsForAtlas(destinationUrl);

  const sourceConnection = await mongoose.createConnection(sourceUrl).asPromise();
  const destinationConnection = await mongoose.createConnection(destinationUrl).asPromise();

  try {
    const sourceDb = sourceConnection.db;
    const destinationDb = destinationConnection.db;

    if (!sourceDb || !destinationDb) {
      throw new Error('Unable to access one of the databases');
    }

    const collections = await sourceDb.listCollections().toArray();
    const results = [];

    for (const collection of collections) {
      if (!collection.name || isSystemCollection(collection.name)) continue;
      results.push(await copyCollection(collection.name, sourceDb, destinationDb));
    }

    console.log(
      JSON.stringify(
        {
          success: true,
          sourceUrl,
          destinationUrl,
          collectionsCopied: results.length,
          results
        },
        null,
        2
      )
    );
  } finally {
    await sourceConnection.close().catch(() => undefined);
    await destinationConnection.close().catch(() => undefined);
  }
}

void main().catch((error) => {
  console.error('MongoDB migration failed');
  console.error(error);
  process.exit(1);
});