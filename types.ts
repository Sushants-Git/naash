export interface CommandLog {
    id: string;
    timestamp: string;
    command: {
        raw: string;
        executable: string;
        arguments: string[];
        cwd: string;
    };
    output: {
        stderr: string;
        exitCode: number;
        error?: string;
    };
    metadata: {
        user: string;
        platform: string;
        shell: string;
    };
}

