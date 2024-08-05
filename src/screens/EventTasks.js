import React, { useState, useEffect } from 'react';
import EventHeader from '../components/EventHeader';
import ContentArea from '../components/ContentArea';

const EventTasks = () => {
    const [taskData, setTaskData] = useState([]);
    const [statusArray, setStatusArray] = useState({});
    const [selectedEventId, setSelectedEventId] = useState(localStorage.getItem('selectedEventId'));
    const statusArrayKey = 'statusArray';
    const fetchTaskData = () => {
        const taskFileContent = localStorage.getItem('taskFile');
        if (taskFileContent) {
            setTaskData(JSON.parse(taskFileContent));
        }
    };

    const getStatusArray = () => {
        const statusArrayData = localStorage.getItem(statusArrayKey);
        setStatusArray(statusArrayData ? JSON.parse(statusArrayData) : {});
    };

    useEffect(() => {
       fetchTaskData();
       console.log('Status Array:', statusArray);
        getStatusArray();
    }, []);

    useEffect(() => {
        if (selectedEventId && taskData.length > 0) {
            initializeStatusArray(taskData);
        }
    }, [selectedEventId, taskData]);

    const saveStatusArray = (statusArray) => {
        localStorage.setItem(statusArrayKey, JSON.stringify(statusArray));
    };

    const initializeStatusArray = (taskData) => {
        const currentStatusArray = JSON.parse(localStorage.getItem('statusArray') || '{}');
        const currentEventStatus = JSON.parse(localStorage.getItem('currentEventStatus') || '{}');
      
        taskData.forEach(item => {
          if (!currentStatusArray[item.eventid]) {
            currentStatusArray[item.eventid] = 'Not Started'; 
          }
          if (currentEventStatus[item.eventid]) {
            currentStatusArray[item.eventid] = currentEventStatus[item.eventid];
          }
        });
      
        localStorage.setItem('statusArray', JSON.stringify(currentStatusArray));
        setStatusArray(currentStatusArray);
      };

     
      
      
      

    const getEventStatus = (eventId) => {
        if (!statusArray[eventId]) return { allCompleted: false, inProgress: false };

        const statuses = Object.values(statusArray[eventId]);
        const allCompleted = statuses.every(status => status === 'Completed');
        const inProgress = statuses.some(status => status === 'In Progress');

        return { allCompleted, inProgress };
    };

    const updateTaskStatus = (eventId, taskName, status) => {
        const updatedStatusArray = { ...statusArray };
        const eventFileContent = localStorage.getItem('eventFile');
        if (eventFileContent) {
            const jsonData = JSON.parse(eventFileContent);
            const event = jsonData.find(item => item['eventid'] === eventId);
            const startDate = new Date(event['startdate']);
            const endDate = new Date(event['enddate']);
            const currentDate = new Date();
            let eventStatus;
            if (currentDate >= startDate && currentDate <= endDate) {
                eventStatus = 'In Progress';
            } else if (currentDate > endDate) {
                eventStatus = 'Failed';
            } else if (currentDate < startDate) {
                eventStatus = 'Not Started';
            }

            if (eventStatus === 'Failed') {
                return;
            }
        }

        if (!updatedStatusArray[eventId]) {
            updatedStatusArray[eventId] = {};
        }
        updatedStatusArray[eventId][taskName] = status;
        saveStatusArray(updatedStatusArray);
        setStatusArray(updatedStatusArray);

        const { allCompleted, inProgress } = getEventStatus(eventId);

        updateEventStatusInDisplay(eventId, inProgress ? 'In Progress' : allCompleted ? 'Completed' : 'Not Started');
    };

    const updateEventStatusInDisplay = (eventId, status) => {
        const eventFileContent = localStorage.getItem('eventFile');
        if (eventFileContent) {
            const jsonData = JSON.parse(eventFileContent);
            const updatedData = jsonData.map(item => {
                if (item['eventid'] === eventId) {
                    return { ...item, status };
                }
                return item;
            });
            localStorage.setItem('eventFile', JSON.stringify(updatedData));
            // Here, you might need to trigger a re-render or update some part of the UI to reflect changes
        }
    };

    const creatingTable = (data, eventId) => {
        if (data.length === 0) return null;
        const headers = Object.keys(data[0]);
        return (
            <table>
                <thead>
                    <tr>
                        {headers.map(header => (
                            <th key={header}>{header}</th>
                        ))}
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(item => {
                        if (item['eventid'] === eventId) {
                            return (
                                <tr key={item['taskname']}>
                                    {headers.map(header => (
                                        <td key={header}>{item[header]}</td>
                                    ))}
                                    <td>
                                        <select
                                            value={statusArray[eventId] && statusArray[eventId][item['taskname']] || 'Not Started'}
                                            onChange={(e) => updateTaskStatus(eventId, item['taskname'], e.target.value)}
                                        >
                                            {['Not Started', 'In Progress', 'Completed', 'Failed'].map(option => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            );
                        }
                        return null;
                    })}
                </tbody>
            </table>
        );
    };

    return (
        <>
            <EventHeader />
            <ContentArea>
                <div className='task-page'>
                    <h2 id="task-heading">Tasks for Selected Event</h2>
                    <div id="event-tasks-content">
                        {creatingTable(taskData, selectedEventId)}
                    </div>
                </div>
            </ContentArea>
        </>
    );
};

export default EventTasks;
