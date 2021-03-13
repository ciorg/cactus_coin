function showModal(modalId, modalClose) {
    const modal = document.getElementById(modalId);

    modal.style.display = "block";

    const span = document.getElementsByClassName(modalClose)[0];

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}
