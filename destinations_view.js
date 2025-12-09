document.addEventListener('DOMContentLoaded', function() {
    var listDiv = document.getElementById('browse-destinations-list');
    var errorP = document.getElementById('browse-destinations-error');
    var searchInput = document.getElementById('search-text');
    var searchButton = document.getElementById('search-button');
    var clearButton = document.getElementById('clear-button');
  
    var allDestinations = []; 
  
    function showTable(destinations) {
      listDiv.innerHTML = '';
  
      if (destinations.length == 0) {
        listDiv.textContent = 'No destinations available.';
        return;
      }
  
      var table = document.createElement('table');
      var headerRow = document.createElement('tr');
      headerRow.innerHTML = `
        <th>Code</th>
        <th>City</th>
        <th>Country</th>
      `;
      table.appendChild(headerRow);
  
      destinations.forEach(function(d) {
        var row = document.createElement('tr');
        row.innerHTML = `
          <td>${d.code}</td>
          <td>${d.city}</td>
          <td>${d.country}</td>
        `;
        table.appendChild(row);
      });
  
      listDiv.appendChild(table);
    }
  
    function loadDestinations() {
      fetch('/api/destinations')
        .then(function(resp) {
          return resp.json();
        })
        .then(function(data) {
          if (data.ok === false) {
            errorP.textContent = data.message || 'Failed to load destinations';
            return;
          }
          errorP.textContent = '';
          allDestinations = data.destinations;
          showTable(allDestinations);
        })
        .catch(function(err) {
          console.log(err);
          errorP.textContent = 'Error loading destinations.';
        });
    }
  
    searchButton.onclick = function() {
      var text = searchInput.value.trim().toLowerCase();
      if (text === '') {
        showTable(allDestinations);
        return;
      }
  
      var filtered = [];
      for (var i = 0; i < allDestinations.length; i++) {
        var d = allDestinations[i];
        var city = (d.city || '').toLowerCase();
        var country = (d.country || '').toLowerCase();
        if (city.indexOf(text) !== -1 || country.indexOf(text) !== -1) {
          filtered.push(d);
        }
      }
      showTable(filtered);
    };
  
    clearButton.onclick = function() {
      searchInput.value = '';
      showTable(allDestinations);
    };
  
    loadDestinations();
  });
  