import React, { useState, useEffect } from 'react';
import EventHeader from '../components/EventHeader';
import ContentArea from '../components/ContentArea';
import { useNavigate } from 'react-router-dom';

const Display = () => {
  const [eventData, setEventData] = useState([]);
  const [statusArray, setStatusArray] = useState({});
  const nav = useNavigate();

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
    if (!statusArray[eventId]) return { allCompleted: false, inProgress: false, allFailed: false };
    const statuses = Object.values(statusArray[eventId]);
    const statusesWithoutLast = statuses.slice(0, -1);
    const allCompleted = statusesWithoutLast.every(status => status === 'Completed');
    const inProgress = statuses.some(status => status === 'In Progress');
    const allFailed = statuses.every(status => status === 'Failed');
    return { allCompleted, inProgress, allFailed };
  };

  useEffect(() => {
    fetchEventData();
    getStatusArray();
  }, []);

  const creatingTable = () => {
    if (eventData.length === 0) return null;
    const headers = Object.keys(eventData[0]);
    const currentDate = new Date();
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
            const startDate = new Date(item['startdate']);
            const endDate = new Date(item['enddate']);
            let status;
            if (currentDate >= startDate && currentDate <= endDate) {
              status = 'In Progress';
            } else if (currentDate > endDate) {
              status = 'Failed';
            } else if (currentDate < startDate) {
              status = 'Not Started';
            }

            const { allCompleted, inProgress, allFailed } = getEventStatus(item['eventid']);
            if (inProgress) {
              status = 'In Progress';
            } else if (allCompleted) {
              status = 'Completed';
            } else if (allFailed) {
              status = 'Failed';
            }

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
    nav(`/eventTasks/${eventId}`);
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
