/**
 * Example data for development and testing reference.
 * Use scripts/seedData.js to populate Firestore with this data.
 */

export const exampleUsers = [
  {
    id: 'admin-user-id',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    approved: true,
    disabled: false,
  },
  {
    id: 'host-user-id',
    name: 'Host User',
    email: 'host@example.com',
    role: 'host',
    approved: true,
    disabled: false,
  },
  {
    id: 'regular-user-id',
    name: 'John Doe',
    email: 'user@example.com',
    role: 'user',
    approved: true,
    disabled: false,
  },
  {
    id: 'pending-user-id',
    name: 'Jane Smith',
    email: 'pending@example.com',
    role: 'user',
    approved: false,
    disabled: false,
  },
]

export const exampleEvents = [
  {
    title: 'Sunday Prayer Meeting',
    area: 'North Area',
    church: 'Grace Community Church',
    activityCode: 'Egt625',
    activityName: '3',
    details: 'Weekly community prayer session for all members.',
    startDate: '2026-06-15',
    startTime: '09:00',
    endTime: '10:30',
    creatorId: 'regular-user-id',
    creatorName: 'John Doe',
    createdById: 'regular-user-id',
    createdByName: 'John Doe',
    createdByRole: 'user',
    supervisorId: 'host-user-id',
    supervisorName: 'Host User',
  },
  {
    title: 'Youth Bible Study',
    area: 'South Area',
    church: 'Hope Fellowship',
    activityCode: 'Egy549',
    activityName: '7',
    details: 'Bible study session for youth members ages 13-18.',
    startDate: '2026-06-18',
    startTime: '18:00',
    endTime: '19:30',
    creatorId: 'regular-user-id',
    creatorName: 'John Doe',
    createdById: 'regular-user-id',
    createdByName: 'John Doe',
    createdByRole: 'user',
    supervisorId: '',
    supervisorName: '',
  },
  {
    title: 'Community Visit',
    area: 'East Area',
    church: 'New Life Assembly',
    activityCode: 'Egt553',
    activityName: '12',
    details: 'Visit to new community members in the east district.',
    startDate: '2026-06-20',
    startTime: '14:00',
    endTime: '16:00',
    creatorId: 'host-user-id',
    creatorName: 'Host User',
    createdById: 'host-user-id',
    createdByName: 'Host User',
    createdByRole: 'host',
    supervisorId: 'admin-user-id',
    supervisorName: 'Admin User',
  },
]

export const exampleComments = [
  {
    eventId: 'event-1',
    userId: 'host-user-id',
    userName: 'Host User',
    text: 'Great initiative! Please prepare the attendance sheet.',
  },
  {
    eventId: 'event-1',
    userId: 'admin-user-id',
    userName: 'Admin User',
    text: 'Approved. Make sure to report KPI metrics after the event.',
  },
]

export const exampleNotifications = [
  {
    userId: 'regular-user-id',
    title: 'Account Approved',
    message: 'Welcome John Doe! Your account has been approved.',
    read: true,
  },
  {
    userId: 'regular-user-id',
    title: 'New Comment',
    message: 'Host User commented on "Sunday Prayer Meeting"',
    read: false,
  },
  {
    userId: 'host-user-id',
    title: 'New Event',
    message: 'John Doe created a new event: "Youth Bible Study"',
    read: false,
  },
]
