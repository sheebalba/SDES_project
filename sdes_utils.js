export function permute(input, table) {
    let output = "";
    for (let pos of table) { output += input[pos - 1]; }
    return output;
}
export function xor(first, second) {
    let result = "";
    for (let i = 0; i < first.length; i++) { result += (first[i] === second[i]) ? "0" : "1"; }
    return result;
}