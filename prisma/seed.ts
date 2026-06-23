import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Ported from the legacy api/seeder.js and enriched with relations (likes,
// friendships, event participants) so feature slices have realistic data to
// build and demo against. Idempotent: clears the relevant tables, then reseeds.
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clear in FK-safe order (cascades cover most, but be explicit).
  await prisma.booking.deleteMany()
  await prisma.ticket.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.friendship.deleteMany()
  await prisma.post.deleteMany()
  await prisma.event.deleteMany()
  await prisma.user.deleteMany()

  const password = await bcrypt.hash('123456', 10)

  const [user1, user2, user3] = await Promise.all([
    prisma.user.create({
      data: {
        username: 'user1',
        email: 'user1@test.test',
        name: 'User One',
        password,
        bio: 'Art and music enthusiast.',
        location: 'Berlin',
        interests: ['Art', 'Music', 'Photography'],
      },
    }),
    prisma.user.create({
      data: {
        username: 'user2',
        email: 'user2@test.test',
        name: 'User Two',
        password,
        bio: 'Always up for a workout.',
        location: 'London',
        interests: ['Sport', 'Fitness', 'Cycling'],
      },
    }),
    prisma.user.create({
      data: {
        username: 'user3',
        email: 'user3@test.test',
        name: 'User Three',
        password,
        bio: 'Software engineer who loves gadgets.',
        location: 'Kyiv',
        interests: ['IT', 'Programming', 'Gaming'],
      },
    }),
  ])

  // Two posts per user; user2 likes one of user1's posts.
  const post1 = await prisma.post.create({
    data: { content: 'First post of user1', createdById: user1.id },
  })
  await prisma.post.createMany({
    data: [
      { content: 'Second post of user1', createdById: user1.id },
      { content: 'First post of user2', createdById: user2.id },
      { content: 'Second post of user2', createdById: user2.id },
      { content: 'First post of user3', createdById: user3.id },
      { content: 'Second post of user3', createdById: user3.id },
    ],
  })
  await prisma.post.update({
    where: { id: post1.id },
    data: { likes: { connect: { id: user2.id } } },
  })

  // A comment on user1's first post.
  await prisma.comment.create({
    data: { content: 'Great first post!', postId: post1.id, commentedById: user2.id },
  })

  // Events — legacy date strings replaced with real DateTimes (upcoming).
  await prisma.event.create({
    data: {
      title: 'Art exhibition opening',
      description: 'An evening celebrating local artists.',
      eventType: ['Art'],
      startDate: new Date('2026-08-02T18:00:00Z'),
      endDate: new Date('2026-08-02T22:00:00Z'),
      location: 'Berlin',
      createdById: user1.id,
      // user2 joins user1's event.
      participants: { connect: { id: user2.id } },
    },
  })
  await prisma.event.create({
    data: {
      title: 'Saturday 5k run',
      description: 'Casual group run in the park.',
      eventType: ['Sport'],
      startDate: new Date('2026-09-03T08:00:00Z'),
      endDate: new Date('2026-09-03T10:00:00Z'),
      location: 'London',
      createdById: user2.id,
    },
  })
  await prisma.event.create({
    data: {
      title: 'Local tech meetup',
      description: 'Talks on web performance and tooling.',
      eventType: ['IT', 'Programming'],
      startDate: new Date('2026-10-04T17:00:00Z'),
      endDate: new Date('2026-10-04T20:00:00Z'),
      location: 'Kyiv',
      createdById: user3.id,
    },
  })

  // Friendships: user1 <-> user2 accepted; user3 -> user1 pending.
  await prisma.friendship.createMany({
    data: [
      { requesterId: user1.id, addresseeId: user2.id, status: 'ACCEPTED' },
      { requesterId: user3.id, addresseeId: user1.id, status: 'PENDING' },
    ],
  })

  console.log('Database seeded.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
