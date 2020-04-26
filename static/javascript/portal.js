function slide(id) {
    if (isOpen(id)) {
      closeNav(id);
    } else {
      openNav(id);
    }
  }

  function isOpen(id) {
    if (document.getElementById(id).style.width === '20%') {
        return true;
    }

    return false;
  }

  function openNav(id) {
    document.getElementById(id).style.width = "20%";
  }

  function closeNav(id) {
    document.getElementById(id).style.width = "0";
  }