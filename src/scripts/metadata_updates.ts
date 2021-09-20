import * as metadata from './metadata_utils';

const args: string[] = process.argv;

console.log(args);

async function updateMetadata(args: string[]) {
    const func = args[2];

    await metadata[func]();
}

updateMetadata(args);
