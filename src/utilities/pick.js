/**
 * Creates a new object using subset of properties from the original
 * @param {*} obj original object 
 * @param {*} props 
 */
module.exports = function (obj, props) {
    if (!obj || !props) return;

    var picked = {};
    props.forEach((prop) => {
        picked[prop] = obj[prop];
    });

    return picked;
}