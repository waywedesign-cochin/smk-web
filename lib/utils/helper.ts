// A helper function to generate an array of years.
// It takes a start year and an end year as arguments.
const generateYearOptions = (startYear: number, endYear: number) => {
  const years = [];
  for (let year = startYear; year <= endYear; year++) {
    years.push(year);
  }
  return years;
};

export { generateYearOptions };
