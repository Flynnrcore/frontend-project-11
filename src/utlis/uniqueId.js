let uniqId = 0;

const uniqueId = () => {
  uniqId += 1;
  return uniqId;
};

export default uniqueId;
