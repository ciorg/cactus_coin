function toggleClassDisplay(args1, args2) {
    const class1Div = document.getElementById(args1.id);
    const class2Div = document.getElementById(args2.id);

    if (hidden(args1.id)) {
        class1Div.style.display = args1.display;
        class2Div.style.display = 'none';
    } else {
        class2Div.style.display = args2.display;
        class1Div.style.display = 'none';
    }
}

function hidden(id) {
    const { display } = document.getElementById(id).style;
    console.log(display);
    if (display == null || display === 'none' || display === '') {
        return true;
    }

    return false;
}
