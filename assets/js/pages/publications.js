document.querySelectorAll('.publication-tab').forEach(function(tab) {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.publication-tab').forEach(function(btn) {
      btn.classList.remove('active');
    });
    document.querySelectorAll('.publication-panel').forEach(function(panel) {
      panel.classList.remove('active');
    });

    tab.classList.add('active');
    document.getElementById(tab.dataset.target).classList.add('active');
  });
});
