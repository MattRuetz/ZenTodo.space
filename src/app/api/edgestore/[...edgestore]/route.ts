import { initEdgeStore } from '@edgestore/server';
import { createEdgeStoreNextHandler } from '@edgestore/server/adapters/next/app';

const es = initEdgeStore.create();

const edgeStoreRouter = es.router({
    publicFiles: es
        .fileBucket({
            accept: ['image/*'],
            maxSize: 1024 * 1024 * 4, // 4MB
        })
        .beforeDelete(async ({ ctx, fileInfo }) => {
            console.log('Deleting file:', fileInfo.url);
            return true; // Allow deletion
        }),
});

const handler = createEdgeStoreNextHandler({
    router: edgeStoreRouter,
});

export { handler as GET, handler as POST };

export type EdgeStoreRouter = typeof edgeStoreRouter;
