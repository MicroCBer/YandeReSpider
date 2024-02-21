export class TaskPool<T> {
    private tasks: (() => Promise<void>)[] = [];
    private running = 0;
    
    constructor(
        private max: number,
    ) {}

    add(task: () => Promise<T>) {
        return new Promise<T>((rs, rj) => {
            this.tasks.push(async () => {
                try {
                    rs(await task());
                } catch (e) {
                    rj(e);
                }
            });
            this.run();
        })
    }

    private async run() {
        if (this.running >= this.max) return;
        this.running++;
        while (this.tasks.length) {
            const task = this.tasks.shift();
            if (!task) break;
            await task();
        }
        this.running--;
    }
}