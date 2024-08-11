export default class functions {
    static convertToPixels(value) {
        if (typeof value === 'number')
            return value;
        var n = parseFloat(value.replace('px', ''));
        if (!n)
            n = 0;
        return n;
    }

    static titleCase(str) {
        var splitStr = str.toLowerCase().split(' ');
        for (var i = 0; i < splitStr.length; i++) {
            splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
        }
        return splitStr.join(' '); 
    }

    static uuidv4() {
        return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
            (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
        );
    }

    static validateDateFormat(value) {
        if (!value || typeof(value) !== "string" || !value.length === 10)
            return false;
        if (!value.includes("yyyy") || !value.includes("mm") || !value.includes("dd") || 
            value.indexOf("yyyy") === -1 || value.indexOf("mm") === -1 || value.indexOf("dd") === -1)
            return false;
        if (value.indexOf("-") === -1 && value.indexOf("/") === -1)
            return false;
        return true;
    }

}