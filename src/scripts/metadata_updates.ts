import * as metadata from './metadata_utils';

const args: string[] = process.argv;

async function updateMetadata(args: string[]) {
    const func = args[2];

    await metadata[func]();
}

updateMetadata(args);
