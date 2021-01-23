$(document).ready(() => {
    $('#notes_table').DataTable({
        searching: true,
        pageLength: 10,
        lengthChange: true,
        lengthMenu: [10, 20, 50, 100],
        columns: [
            { orderable: true, searchable: true },
            { orderable: true, searchable: true },
            { orderable: false, searchable: false }
        ]
    });
});

