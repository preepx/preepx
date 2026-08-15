import API from "@/utils/api";

export const getAtsScore = async (file) => {
  const formData = new FormData();
  formData.append("resume", file);
  const res = await API.post("/ats/score", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
