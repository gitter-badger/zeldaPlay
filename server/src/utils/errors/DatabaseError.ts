/**
 * @prop {string} reasonCode
 * @prop {string} message
 * @prop {string} stack
 */
export class DatabaseError extends Error {
  reasonCode: string;
  /**
   * @param {string} message The message for the error to have
   * @param {string} reasonCode The reason code for the error. For internal use only
   */
  constructor(message: string, reasonCode: string) {
    super();
    this.message = message;
    this.reasonCode = reasonCode;
    Error.captureStackTrace(this, DatabaseError);
  }
}
