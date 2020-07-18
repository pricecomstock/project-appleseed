function prettyCustomPromptSetId(id) {
  if (!id) {
    return "";
  }
  return id.replace("-", "").replace(/(\w{4}(?!$))/g, "$1-");
}

function addInvisibleHyphens(str, charChunkSize) {
  const BREAK_WORD_REGEX = new RegExp(`.{1,${charChunkSize}}`, "g");
  const shyHyphen = "\u00AD";

  return str
    .trim()
    .split(" ")
    .map((word) => {
      try {
        // Get chunks of charChunkSize
        return word.match(BREAK_WORD_REGEX).join(shyHyphen);
      } catch (error) {
        // if we have no matches
        return "";
      }
    })
    .join(" ");
}

export { prettyCustomPromptSetId, addInvisibleHyphens };
