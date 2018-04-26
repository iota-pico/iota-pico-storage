/**
 * Represents data passed to progress callback.
 * @interface
 */
export interface IDataTableProgress {
    numItems: number;
    totalItems: number;
    percent: number;
    status: string;
}
