export class TaskQueue<T> {
    queue: (() => Promise<T>)[] = [];
    running: boolean = false;
    successWaitTime: number = 0;
    failedWaitTime: number = 1000;
    retryCount: number = 3;
    addTask(task: () => Promise<T>) {
        this.queue.push(task);
        if (!this.running) {
            this.run();
        }
    }

    pendingIdleTaskSet = new Set<string>();
    async scheduleTaskWhenIdle(task: () => Promise<T>, idleTime: number, id?: string) {
        if (id) {
            if (this.pendingIdleTaskSet.has(id)) {
                return;
            }
            this.pendingIdleTaskSet.add(id);
        }
        let idleTimer = 0;
        while (idleTimer < idleTime) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            idleTimer += 100;
            if (this.running) {
                idleTimer = 0;
            }
        }

        this.addTask(task);
        if (id) {
            this.pendingIdleTaskSet.delete(id);
        }
    }

    async run() {
        this.running = true;
        while (this.queue.length > 0) {
            const task = this.queue.shift();
            
            if (!task) {
                continue;
            }
            let retry = 0;
            while (retry < this.retryCount) {
                try {
                    await task();
                    break;
                } catch (e) {
                    console.error(e);
                    retry++;
                    if (retry < this.retryCount) {
                        await new Promise((resolve) => setTimeout(resolve, this.failedWaitTime));
                    }
                }
            }

            if (retry >= this.retryCount) {
                await new Promise((resolve) => setTimeout(resolve, this.failedWaitTime));
            } else {
                await new Promise((resolve) => setTimeout(resolve, this.successWaitTime));
            }
        }
        this.running = false;
    }
}