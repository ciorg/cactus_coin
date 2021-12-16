$(document).ready(() => {
    $('#transactions_table').DataTable({
        searching: true,
        pageLength: 25,
        lengthChange: false,
        columns: [
            { orderable: true, searchable: true },
            { orderable: true, searchable: false },
            { orderable: true, searchable: false },
            { orderable: true, searchable: false },
            { orderable: true, searchable: false },
            { orderable: true, searchable: false },
            { orderable: true, searchable: false },
            { orderable: true, searchable: false },
            { orderable: false, searchable: false }
        ]
    });
});
