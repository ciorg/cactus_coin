$(document).ready(() => {
    $('#market_table').DataTable({
        searching: true,
        pageLength: 25,
        lengthChange: false,
        columns: [
            { orderable: true, searchable: false },
            { orderable: true },
            { orderable: true },
            { orderable: true, searchable: false },
            { orderable: true, searchable: false }
        ]
    });
});

