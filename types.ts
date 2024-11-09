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

export interface Config {
    gemini_apiKey: string;
    azure_endpoint: string;
    azure_apiKey: string;
    azure_deploymentName: string;
}

