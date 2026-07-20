/**
 * Seed script for example data.
 * Run with: node scripts/seedData.js
 *
 * Requires Firebase Admin SDK credentials.
 * Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path.
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS

if (!serviceAccountPath) {
  console.error('Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path')
  process.exit(1)
}

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccountPath) })
}

const db = getFirestore()
const now = Timestamp.now()

const exampleUsers = [
  {
    id: 'admin-user-id',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    approved: true,
    disabled: false,
    createdAt: now,
  },
  {
    id: 'host-user-id',
    name: 'Host User',
    email: 'host@example.com',
    role: 'host',
    approved: true,
    disabled: false,
    createdAt: now,
  },
  {
    id: 'regular-user-id',
    name: 'John Doe',
    email: 'user@example.com',
    role: 'user',
    approved: true,
    disabled: false,
    createdAt: now,
  },
]

const exampleEvents = [
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
    createdAt: now,
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
    createdAt: now,
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
    createdAt: now,
  },
]

async function seed() {
  console.log('Seeding users...')
  for (const user of exampleUsers) {
    const { id, ...data } = user
    await db.collection('users').doc(id).set(data)
    console.log(`  Created user: ${user.name}`)
  }

  console.log('Seeding events...')
  for (const event of exampleEvents) {
    const ref = await db.collection('events').add(event)
    console.log(`  Created event: ${event.title} (${ref.id})`)
  }

  console.log('Seed complete!')
  console.log('\nNote: Create matching Firebase Auth accounts for the example emails.')
}

seed().catch(console.error)
