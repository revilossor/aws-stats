/*
  checks if arg is a value in data json
*/
module.exports = (arg, data, caseSensitive = false) => {
  if(!arg || !data) { return false; }
  if(typeof arg === 'string' && !caseSensitive) { arg = arg.toUpperCase(); }
  let datum;
  for(let key in data) {
    datum = data[key];
    if(typeof datum === 'string' && !caseSensitive) { datum = datum.toUpperCase(); }
    if(datum === arg) { return true; }
  }
  return false;
};
