declare namespace NodeJS {
    interface Process {
        env: ProcessEnv;
        versions: ProcessVersions;
        platform: string;
    }

    interface ProcessEnv {
        [key: string]: string | undefined;
        NODE_ENV?: 'development' | 'production';
    }

    interface ProcessVersions {
        node?: string;
    }
}

declare const process: NodeJS.Process;
