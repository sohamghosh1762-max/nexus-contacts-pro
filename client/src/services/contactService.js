import API from "./api";

export const getContacts = async () => {
  const response = await API.get("/contacts");

  return response.data;
};

export const createContact = async (data) => {
  const response = await API.post("/contacts", data);

  return response.data;
};