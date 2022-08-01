export const blank = function (e) {
    switch (e) {
        case "":
        case 0:
        case "0":
        case null:
        case false:
        case undefined:
            return true;
        default:
            return false;
    }
}

export const isError = function (results, prop) {

    if (blank(results)) {
        return {valid: false, message:''}
    }
    console.log(2)
    if (blank(results['errors'])) {
        return {valid: false, message:''}
    }
    console.log(3)
    if (blank(results['errors'][prop])) {
        return {valid: false, message:''}
    } else{
        console.log(results['errors'][prop])
        return {valid: true, message:results['errors'][prop]}
    }

}