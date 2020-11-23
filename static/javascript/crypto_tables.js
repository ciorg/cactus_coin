$(document).ready(() => {
    $('#market_table').DataTable({
        searching: false,
        pageLength: 20,
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

