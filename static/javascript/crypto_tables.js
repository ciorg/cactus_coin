$(document).ready(() => {
    $('#market_table').DataTable({
        searching: false,
        pageLength: 25,
        lengthChange: false,
        "columns": [
            { "orderable": true },
            { "orderable": true },
            { "orderable": true },
            { "orderable": true },
            { "orderable": true }
        ]
    });
});

