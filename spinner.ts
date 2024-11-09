import readline from 'readline';

type SpinnerFrame = [string, string]; // [animation, state]

interface SpinnerOptions {
    interval?: number;
    stream?: NodeJS.WriteStream;
    color?: boolean;
}

interface AnsiColors {
    cyan: string;
    blue: string;
    reset: string;
}

class CompactAISpinner {
    private readonly frames: SpinnerFrame[];
    private readonly interval: number;
    private readonly stream: NodeJS.WriteStream;
    private readonly color: boolean;
    private frameIndex: number;
    private isSpinning: boolean;
    private spinnerInterval: NodeJS.Timeout | null;

    constructor(options: SpinnerOptions = {}) {
        this.frames = [
            // Brain processing animation
            ['⟨ ◠◡◠ ⟩', '  think'],
            ['⟨ ◡◠◡ ⟩', '  learn'],
            ['⟨ ◠◡◠ ⟩', ' neural'],
            ['⟨ ◡◠◡ ⟩', '  sync '],

            // Circuit flow animation
            ['[←↔→]', ' parse'],
            ['[→↔←]', '  map '],
            ['[←↔→]', ' flow '],
            ['[→↔←]', ' link '],

            // Data pulse animation
            ['(∙∵∙)', ' data '],
            ['(∙∴∙)', ' proc '],
            ['(∙∵∙)', ' calc '],
            ['(∙∴∙)', ' eval '],

            // Matrix scan animation
            ['⟦░▒▓⟧', ' scan '],
            ['⟦▒▓░⟧', ' read '],
            ['⟦▓░▒⟧', ' load '],
            ['⟦░▒▓⟧', ' feed ']
        ];

        this.interval = options.interval ?? 100;
        this.stream = options.stream ?? process.stdout;
        this.color = options.color ?? true;
        this.frameIndex = 0;
        this.isSpinning = false;
        this.spinnerInterval = null;
    }

    private get colors(): AnsiColors {
        const noColor = { cyan: '', blue: '', reset: '' };
        if (!this.color) return noColor;

        return {
            cyan: '\x1b[36m',
            blue: '\x1b[34m',
            reset: '\x1b[0m'
        };
    }

    public start(text = ''): void {
        if (this.isSpinning) return;
        this.isSpinning = true;
        this.frameIndex = 0;

        // Hide cursor
        this.stream.write('\x1B[?25l');

        this.render(text);
        this.spinnerInterval = setInterval(() => {
            this.render(text);
        }, this.interval) as NodeJS.Timeout;

        // Handle process exit
        this.setupExitHandlers();
    }

    private setupExitHandlers(): void {
        // Ensure cleanup on process exit
        process.on('exit', this.stop.bind(this));
        process.on('SIGINT', () => {
            this.stop();
            process.exit(0);
        });

        process.on('SIGTERM', this.stop.bind(this));
    }

    private render(text: string): void {
        const [animation, state] = this.frames[this.frameIndex];
        const { cyan, blue, reset } = this.colors;
        const color = this.frameIndex < 8 ? cyan : blue;

        readline.clearLine(this.stream, 0);
        readline.cursorTo(this.stream, 0);

        this.stream.write(
            `${color}${animation}${state}${reset} ${text}`
        );

        this.frameIndex = (this.frameIndex + 1) % this.frames.length;
    }

    public stop(): void {
        if (!this.isSpinning) return;

        if (this.spinnerInterval) {
            clearInterval(this.spinnerInterval);
            this.spinnerInterval = null;
        }

        this.isSpinning = false;

        // Clear line and reset cursor
        readline.clearLine(this.stream, 0);
        readline.cursorTo(this.stream, 0);

        // Show cursor
        this.stream.write('\x1B[?25h');
    }

    // Method to check if spinner is currently active
    public isActive(): boolean {
        return this.isSpinning;
    }
}

export default CompactAISpinner;
