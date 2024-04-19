export class DebounceCancelError extends Error {
  constructor() {
    super("Debounce canceled");
  }
}

interface Debounce {
  timeout: NodeJS.Timeout;
  reject: () => void;
}

export class Debouncer {
  private debounced: Debounce | undefined = undefined;
  constructor(private debounceTimeout = 150) {}

  cancel = () => {
    if (this.debounced) {
      // cancel planned preview
      clearTimeout(this.debounced.timeout);
      // reject the promise to ensure completion
      this.debounced.reject();
      // reset the preview state
      this.debounced = undefined;
    }
  };

  debounce = (callback: () => Promise<void>) => {
    // schedule new preview
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(async () => {
        try {
          resolve(await callback());
        } catch (error) {
          reject(error);
        } finally {
          this.debounced = undefined;
        }
      }, this.debounceTimeout);

      // store the current timeout
      this.debounced = {
        reject: () => reject(new DebounceCancelError()),
        timeout,
      };
    }).catch((error) => {
      if (!(error instanceof DebounceCancelError))
        // swallow debounce cancellations
        throw error;
    });
  };
}
