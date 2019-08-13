/**
 * Creates a new array using subset of properties from the original object
 * @param {*} obj original object 
 * @param {*} props 
 */
module.exports = function (obj, props) {
    if (!obj || !props) return;

    var picked = [];
    props.forEach((prop) => {
        picked.push(obj[prop]);
    });

    return picked;
}