/**
 * This is a helper to store handles (or any other unserializable objects).
 * The reason to have this is mainly because Redux store can only store serializable items.
 * By depositing handles in this store, it returns deposit IDs that can be saved in Redux store.
 */

import uuid from 'uuid/v4';

class HandleStorage {
  constructor() {
    this.handles_ = {};
  }

  /**
   * @param {Object} handle - The handle to store.
   * @returns {string} - Return the ID of the stored handle.
   */
  deposit (handle) {
    const handleId = uuid();

    this.handles_[handleId] = handle;

    return handleId;
  }

  /**
   * @param {string} handleId - The ID of the stored handle to release.
   * @returns {Object} - Returns the stored handle.
   */
  withdraw (handleId) {
    if (!(handleId in this.handles_)) {
      return null;
    }

    const handle = this.handles_[handleId];

    delete this.handles_[handleId];

    return handle;
  }
}

export default new HandleStorage();
