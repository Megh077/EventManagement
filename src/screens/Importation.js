import React, { useState, useEffect } from 'react'; 
import EventHeader from '../components/EventHeader';
import ContentArea from '../components/ContentArea'; 

const Importation = () => {
  const [eventFileContent, setEventFileContent] = useState('');
  const [taskFileContent, setTaskFileContent] = useState('');
  const [eventUploaded, setEventUploaded] = useState(false);
  const [taskUploaded, setTaskUploaded] = useState(false);

  const expectedEventHeaders = ['eventid', 'eventname', 'startdate', 'enddate'];
  const expectedTaskHeaders = ['eventid', 'taskname'];

  const handleEventFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvContent = e.target.result;
      const rows = csvContent.trim().split('\n');
      const headers = rows[0].split(',').map(header => header.trim());
      if (!validateHeaders(headers, expectedEventHeaders)) {
        showWarningModal("Invalid event file headers");
        return;
      }
      const jsonData = csvToJson(csvContent);
      for (const event of jsonData) {
        const startDate = new Date(event['startdate']);
        const endDate = new Date(event['enddate']);
        if (endDate < startDate) {
            showWarningModal(`End date (${endDate.toDateString()}) is before start date (${startDate.toDateString()}) for event ID ${event['eventid']}.`);
            return;
        }
      }
      for (let i = 0; i < jsonData.length; i++) {
        const eventA = jsonData[i];
        const startDateA = new Date(eventA['startdate']);
        const endDateA = new Date(eventA['enddate']);
        for (let j = i + 1; j < jsonData.length; j++) {
          const eventB = jsonData[j];
          const startDateB = new Date(eventB['startdate']);
          const endDateB = new Date(eventB['enddate']);

          if ((startDateA <= endDateB) && (endDateA >= startDateB)) {
            showWarningModal(`Events with IDs ${eventA['eventid']} and ${eventB['eventid']} overlap. Please ensure that events do not overlap.`);
            return;
          }
        }
      }

      const eventIds = jsonData.map(event => event['eventid']);
      const uniqueEventIds = new Set(eventIds);
      if (uniqueEventIds.size !== eventIds.length) {
        showWarningModal("Event IDs are not unique in the event file.");
        return;
      }
      localStorage.setItem('eventFile', JSON.stringify(jsonData));
      const currentEventStatus = {};
      const currentDate = new Date();
      jsonData.forEach(event => {
      const startDate = new Date(event['startdate']);
      const endDate = new Date(event['enddate']);
      let status;
      if (currentDate >= startDate && currentDate <= endDate) {
        status = 'In Progress';
    } else if (currentDate > endDate) {
      status = 'Failed';
    } else if (currentDate < startDate) {
      status = 'Not Started';
    }
    currentEventStatus[event.eventid] = status;
  });
  localStorage.setItem('currentEventStatus', JSON.stringify(currentEventStatus));

      setEventUploaded(true);
      showWarningModal("Event file uploaded successfully");
    };
    reader.readAsText(file);
  };

  const handleTaskFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvContent = e.target.result;
      const rows = csvContent.trim().split('\n');
      const headers = rows[0].split(',').map(header => header.trim());
      if (!validateHeaders(headers, expectedTaskHeaders)) {
        showWarningModal("Invalid task file headers");
        return;
      }
      const jsonData = csvToJson(csvContent);
      const eventFileContent = localStorage.getItem('eventFile');
      if (eventFileContent) {
        const eventJsonData = JSON.parse(eventFileContent);
        const eventIds = new Set(eventJsonData.map(item => item.eventid));
        const taskEventIds = jsonData.map(item => item.eventid);
        const missingEventIds = taskEventIds.filter(id => !eventIds.has(id));
        if (missingEventIds.length > 0) {
          alert(`Warning: The following event IDs in the task file are not present in the event file: ${missingEventIds.join(', ')}`);
        }
      }
      localStorage.setItem('taskFile', JSON.stringify(jsonData));
      setTaskUploaded(true);
      showWarningModal("Task file uploaded successfully");
    };
    reader.readAsText(file);
  };

  const csvToJson = (csv) => {
    const rows = csv.trim().split('\n');
    const headers = rows[0].split(',').map(header => header.trim());
    return rows.slice(1).map(row => {
      const values = row.split(',').map(value => value.trim());
      let obj = {};
      headers.forEach((header, i) => {
        obj[header] = values[i];
      });
      return obj;
    });
  };

  const validateHeaders = (headers, expectedHeaders) => {
    if (headers.length !== expectedHeaders.length) {
      return false;
    }
    return expectedHeaders.every((header, index) => header === headers[index]);
  };

  const showWarningModal = (message) => {
    alert(message); 
  };

  const displayEvent = () => {
    const fileType = document.getElementById('type-of-file').value;
    const fileInput = document.getElementById('file-input').files[0];
    if (fileType && fileInput) {
      if (fileType === 'event') {
        handleEventFile(fileInput);
      } else if (fileType === 'task') {
        handleTaskFile(fileInput);
      }
    } else {
      showWarningModal('Please select a file type and a file.');
    }
  };

  const updateNextPageButtonVisibility = () => {
    const nextPageButton = document.getElementById('nextPageButton');
    if (nextPageButton) {
      nextPageButton.style.display = (eventUploaded && taskUploaded) ? 'inline' : 'none';
    }
  };

  useEffect(() => {
    updateNextPageButtonVisibility();
  }, [eventUploaded, taskUploaded]);

  const goToNextPage = () => {
    window.location.href = 'display';
  };

  return (
    <>
      <EventHeader />
      <ContentArea>
        <div className='import-page'>
          <div className="import-interface">
            <div className="import-heading">IMPORT YOUR FILES HERE</div>
            <div className="importing-elements">
              <div className="import-type-select">
                <label htmlFor="type-of-file">Specify the file type :</label>
                <select id="type-of-file">
                  <option value="" disabled>Select your file type</option>
                  <option value="event">Event</option>
                  <option value="task">Task</option>
                </select>
              </div>
              <div className="import-box">
                <label htmlFor="file-input">DROP YOUR FILE HERE</label>
                <input type="file" id="file-input" accept=".csv" />
              </div>
            </div>
            <div className="import-submit-button">
              <input type="button" value="SUBMIT" onClick={displayEvent} />
            </div>
            <div id="message"></div>
            <button id="nextPageButton" style={{ display: 'none' }} onClick={goToNextPage}>Next page</button>
          </div>
        </div>
      </ContentArea>
    </>
  );
};

export default Importation;
