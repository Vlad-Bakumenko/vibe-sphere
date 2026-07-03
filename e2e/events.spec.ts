import { test, expect, type Page } from '@playwright/test'

async function login(page: Page) {
  await page.goto('/login')
  await page.getByLabel('Email').fill('user2@test.test')
  await page.getByLabel('Password').fill('123456')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('**/feed')
}

test('creates an event and views it', async ({ page }) => {
  await login(page)
  await page.goto('/events/new')

  const title = `Test Event ${Date.now()}`
  await page.getByLabel('Title').fill(title)
  await page.getByLabel('Description').fill('An event created by an e2e test.')
  await page.getByRole('button', { name: 'Music', exact: true }).click()
  await page.getByLabel('Starts').fill('2027-03-01T18:00')
  await page.getByLabel('Ends').fill('2027-03-01T21:00')
  await page.getByLabel('Location').fill('Berlin')
  await page.getByRole('button', { name: 'Create event' }).click()

  // Redirected to the event detail page.
  await expect(page.getByRole('heading', { name: title })).toBeVisible()
  await expect(page.getByText('An event created by an e2e test.')).toBeVisible()
})

test('joins a seeded event from its detail page', async ({ page }) => {
  // Fresh user so they haven't already joined (idempotent across runs).
  const suffix = Date.now()
  await page.goto('/signup')
  await page.getByLabel('Full name').fill('Event Joiner')
  await page.getByLabel('Username').fill(`joiner${suffix}`)
  await page.getByLabel('Email').fill(`joiner${suffix}@test.test`)
  await page.getByLabel('Password').fill('123456')
  await page.getByRole('button', { name: 'Create account' }).click()
  await page.waitForURL('**/feed')

  await page.goto('/events')
  await page.getByRole('link', { name: 'Local tech meetup' }).first().click()
  await page.waitForURL(/\/events\/.+/)

  await page.getByRole('button', { name: 'Join' }).click()
  await expect(page.getByRole('button', { name: 'Leave' })).toBeVisible()
})
