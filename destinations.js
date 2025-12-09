document.addEventListener('DOMContentLoaded', function() {
    var listDiv = document.getElementById('destinations-list');
    var errorP = document.getElementById('destinations-error');
    var form = document.getElementById('destination-form');
    var msgP = document.getElementById('destinations-form-msg');
  
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
          showTable(data.destinations);
        })
        .catch(function(err) {
          console.log(err);
          errorP.textContent = 'Error loading destinations.';
        });
    }

    form.onsubmit = function() {
      errorP.textContent = '';
      msgP.textContent = '';
  
      var code = document.getElementById('dest-code').value.trim();
      var city = document.getElementById('dest-city').value.trim();
      var country = document.getElementById('dest-country').value.trim();
  
      if (!code || !city || !country) {
        errorP.textContent = 'Please fill out all fields.';
        return false;
      }
  
      fetch('/api/destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code, city: city, country: country })
      })
        .then(function(resp) {
          return resp.json();
        })
        .then(function(data) {
          if (data.ok === false) {
            errorP.textContent = data.message || 'Failed to add destination.';
            return;
          }
  
          msgP.textContent = 'Destination added successfully!';
          document.getElementById('dest-code').value = '';
          document.getElementById('dest-city').value = '';
          document.getElementById('dest-country').value = '';
  
          loadDestinations();
        })
        .catch(function(err) {
          console.log(err);
          errorP.textContent = 'Error adding destination.';
        });
      return false;
    };
  
    loadDestinations();
  });
  