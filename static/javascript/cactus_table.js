$(document).ready(() => {
    $('#cactus_table').DataTable({
        searching: false,
        pageLength: 20,
        lengthChange: false,
        order: [[ 1, "desc" ]],
        columns: [
            { orderable: true, searchable: false },
            { orderable: true, searchable: false },
            { orderable: false, searchable: false },
            { orderable: true, searchable: false },
            { orderable: true, searchable: false },
            { orderable: true, searchable: false }
        ]
    });
});

