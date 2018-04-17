/**
 * Represents a class that can get/set configuration.
 * @interface
 */
export interface IConfigProvider {
    /**
     * Load the configuration.
     * @returns The configuration.
     */
    load<T>(): Promise<T>;

    /**
     * Save the configuration.
     * @param config The configuration to set.
     */
    save<T>(config: T): Promise<void>;
}
