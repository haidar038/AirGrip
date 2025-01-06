interface Global {
    process: NodeJS.Process;
    Buffer: typeof Buffer;
}

declare const global: Global;
declare const Buffer: typeof Buffer;
declare const process: NodeJS.Process;
