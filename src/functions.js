export default class functions {
    static convertToPixels(value) {
        var n = parseFloat(value.replace('px', ''));
        if (!n)
            n = 0;
        return n;
    }
}