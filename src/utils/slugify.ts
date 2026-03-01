export const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-")         // space to hyphen
    .replace(/-+/g, "-");         // remove duplicate hyphen
};