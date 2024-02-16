export const normalizePhone = (_phone: string) => {
  let phone = _phone.trim();
  if (phone.length > 13 && phone.startsWith("+982198")) {
    return phone.replace("+982198", "0");
  }
  if (phone.length === 10 && phone.startsWith("9")) {
    return 0 + phone;
  }
  if (phone.length < 9) {
    return phone;
  }
  if (phone.startsWith("+98")) {
    return phone.replace("+98", "0");
  }
  if (phone.startsWith("98")) {
    return phone.replace("98", "0");
  }
  return phone;
};

export const toPersianNumber = function (string: string) {
  string = "" + string;

  return string.replace(/\d/g, (number) =>
    parseInt(number).toLocaleString("fa-IR")
  );
};

export const toPersianCalendar = function (
  date: string,
  options?: Intl.DateTimeFormatOptions
) {
  const inputDate = new Date(date);

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    calendar: "persian",
  };

  // Format the date into Persian calendar
  return new Intl.DateTimeFormat(
    "fa-IR-u-ca-persian",
    options || defaultOptions
  ).format(inputDate);
};
