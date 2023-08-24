export const normalizePhone = (_phone: string) => {
    let phone = _phone.trim()
    if (phone.length > 13 && phone.startsWith("+982198")) {
        return phone.replace("+982198", "0")
    }
    if (phone.length === 10 && phone.startsWith("9")) {
        return 0 + phone
    }
    if (phone.length < 9) {
        return phone
    }
    if (phone.startsWith("+98")) {
        return phone.replace("+98", "0")
    }
    if (phone.startsWith("98")) {
        return phone.replace("98", "0")
    }
    return phone
}

export const toPersianNumber = function (string: string) {
    string = '' + string;

    return string.replace(/\d/g, number =>
        parseInt(number).toLocaleString('fa-IR')
    );
};