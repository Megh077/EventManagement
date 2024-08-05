import React, { useState, useEffect } from 'react';
import EventHeader from '../components/EventHeader';
import ContentArea from '../components/ContentArea';

const Display = () => {
  const [eventData, setEventData] = useState([]);
  const [statusArray, setStatusArray] = useState({});
  const fetchEventData = () => {
    const eventFileContent = localStorage.getItem('eventFile');
    if (eventFileContent) {
      const jsonData = JSON.parse(eventFileContent);
      setEventData(jsonData);
    }
  };

  const getStatusArray = () => {
    const statusArrayData = localStorage.getItem('statusArray');
    if (statusArrayData) {
      setStatusArray(JSON.parse(statusArrayData));
    } else {
      setStatusArray({});
    }
  };
  
  
  const getEventStatus = (eventId) => {
    if (!statusArray[eventId]) return { allCompleted: false, inProgress: false };
  
    const statuses = Object.values(statusArray[eventId]);
    const allCompleted = statuses.every(status => status === 'Completed');
    const inProgress = statuses.some(status => status === 'In Progress');
  
    return { allCompleted, inProgress };
  };
  

  useEffect(() => {
    fetchEventData();
    getStatusArray();
  }, []);


  const creatingTable = () => {
    if (eventData.length === 0) return null;
  
    const headers = Object.keys(eventData[0]);
    return (
      <table>
        <thead>
          <tr>
            {headers.map(header => (
              <th key={header}>{header}</th>
            ))}
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {eventData.map(item => {
            const status = statusArray[item['eventid']] || 'Not Started';
            return (
              <tr key={item['eventid']}>
                {headers.map(header => (
                  <td key={header}>{item[header] || ''}</td>
                ))}
                <td>{status}</td>
                <td>
                  <button onClick={() => handleActionButtonClick(item['eventid'])}>Action</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };
  
  
  const handleActionButtonClick = (eventId) => {
    localStorage.setItem('selectedEventId', eventId);
    window.location.href = 'eventTasks';
  };

  return (
    <>
      <EventHeader />
      <ContentArea>
        <div className='event-page'>
        <h2 id="event-heading">Event File Content</h2>
        <div id="event-file-content">
          {creatingTable()}
        </div>
        </div>
      </ContentArea>
    </>
  );
};

export default Display;
