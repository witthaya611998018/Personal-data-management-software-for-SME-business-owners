function addDate() {
  const fullDate = new Date();
  const timeZone = 7;
  const offset = (fullDate.getTimezoneOffset() + (timeZone * 60)) * 60 * 1000;
  fullDate.setTime(fullDate.getTime() + offset);
  fullDate.setMonth(fullDate.getMonth());
  const date = `${fullDate.getFullYear()}-${fullDate.getMonth() + 1}-${fullDate.getDate()} ${fullDate.getHours()}:${fullDate.getMinutes()}:${fullDate.getSeconds()}`;
  return date;
}

module.exports = addDate;
