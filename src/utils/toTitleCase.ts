const toTitleCase = (str: string) => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase().replace(/_/g, " ")
  });
}

export default toTitleCase;