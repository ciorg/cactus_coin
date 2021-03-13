function toggleClassDisplay(class1Id, class2Id) {
    const class1Div = document.getElementById(class1Id);
    const class2Div = document.getElementById(class2Id);

    if (hidden(class1Id)) {
        class1Div.style.display = 'block';
        class2Div.style.display = 'none';
    } else {
        class2Div.style.display = 'grid';
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
