const addCommas = (num) => {
  if (num === null) {
    return 0;
  }
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

module.exports = { addCommas };