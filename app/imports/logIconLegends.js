let legends = {};

export const registerLegends = (moreLegends) => {
  legends = {
    ...legends,
    ...moreLegends,
  };

  return legends;
};

export const printLegends = () => {
  console.log(JSON.stringify(legends, null, 2));
};
