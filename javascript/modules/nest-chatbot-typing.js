export function animateTextTyping(node, _text = '') {
    let text;
    if (_text.length > 0) {
        text = br2nl(_text);
    } else {
        text = br2nl(node.textContent);
    }
    console.info(text);
    const chars = text.split("");

    node.innerHTML = "";
    node.classList.add("typing");
    let i = 0;

    const addNextChar = (i) => {
        let nextChar = chars[i] === "\n" ? "<br>" : chars[i];
        node.innerHTML += nextChar; // if sorrounded by <span>....</span>, create a cursor

        if (i < chars.length - 1) {
            setTimeout(function () {
                addNextChar(i + 1);
            }, 5 + Math.random() * 15); // 5-30ms
        } else {
            setTimeout(function () {
                node.classList.remove("typing");
            }, 10 + Math.random() * 30); // 10-60ms
        }
    }

    addNextChar(i);
}

/**
 * This function inverses text from PHP's nl2br() with default parameters.
 * https://gist.github.com/yidas/41cc9272d3dff50f3c9560fb05e7255e
 * 
 * @param {string} str Input text
 * @param {boolean} replaceMode Use replace instead of insert
 * @return {string} Filtered text
 */
function br2nl(str, replaceMode = true) {

    var replaceStr = (replaceMode) ? "\n" : '';
    // Includes <br>, <BR>, <br />, </br>
    return str.replace(/<\s*\/?br\s*[\/]?>/gi, replaceStr);
}