export default {
  // A list with basic info about each item.
  'data.checklists.items': [],
  // True if the list is being loaded (even if data is already ready).
  'data.checklists.loading': false,
  // True if the list has been loaded (even if a new loading is going on).
  'data.checklists.ready': false,
  // True if the list subscription is active.
  'data.checklists.subscribed': false,
  /**
   * A map of full documents.
   * Each item has the shape:
   * {
   *   id: String,
   *   // True if we are loading the latest version from server.
   *   loading: Boolean,
   *   // True if subscription is active.
   *   subscribed: Boolean,
   *   // True if at least one version of the document is loaded.
   *   ready: Boolean,
   *   // The date of the last time the document is pulled from server.
   *   lastUpdated: Number,
   *   // The document object. Could be `null`, which means the document is 404.
   *   source: Object,
   * }
   */
  'data.checklists.documents': {},
};
