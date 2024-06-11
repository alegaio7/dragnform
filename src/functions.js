export default class functions {
    static convertToPixels(value) {
        if (typeof value === 'number')
            return value;
        var n = parseFloat(value.replace('px', ''));
        if (!n)
            n = 0;
        return n;
    }
}