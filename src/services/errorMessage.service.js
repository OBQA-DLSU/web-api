module.exports = {
  serverError: () => {
    return 'There is an Internal server error. Try again next time.';
  },
  customError: (errorMessage) => {
    return errorMessage;
  },
  clientError: (moreDetails) => {
    // where moreDetails is a string
    return `There is an error on the client: ${moreDetails}` ;
  }
};
