import API from "../utils/api";

export const getBtecNotes = (params = {}) =>
  API.get("/btec-notes", { params }).then((r) => r.data);

export const getBtecNoteById = (id) =>
  API.get(`/btec-notes/${id}`).then((r) => r.data);

export const getBtecNotesMeta = () =>
  API.get("/btec-notes/meta").then((r) => r.data);
