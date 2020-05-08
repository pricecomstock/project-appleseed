function prettyCustomPromptSetId(id) {
  if (!id) {
    return "";
  }
  return id.replace("-", "").replace(/(\w{4}(?!$))/g, "$1-");
}

export { prettyCustomPromptSetId };
