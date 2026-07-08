import { test, expect, type Page } from '@playwright/test'

async function loginAsUser2(page: Page) {
  await page.goto('/login')
  await page.getByLabel('Email').fill('user2@test.test')
  await page.getByLabel('Password').fill('123456')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('**/feed')
}

async function signupFresh(page: Page, suffix: number) {
  await page.goto('/signup')
  await page.getByLabel('Full name').fill('Ticket Buyer')
  await page.getByLabel('Username').fill(`buyer${suffix}`)
  await page.getByLabel('Email').fill(`buyer${suffix}@test.test`)
  await page.getByLabel('Password').fill('123456')
  await page.getByRole('button', { name: 'Create account' }).click()
  await page.waitForURL('**/feed')
}

// Verifies the full paid-event setup and the Buy button gating, up to (but not
// through) Stripe's hosted checkout, which cannot be automated here.
test('a paid event shows a Buy button to other users', async ({ page }) => {
  const suffix = Date.now()

  await loginAsUser2(page)
  await page.goto('/events/new')
  await page.getByLabel('Title').fill(`Paid Event ${suffix}`)
  await page.getByLabel('Description').fill('A paid event created by an e2e test.')
  await page.getByRole('button', { name: 'Music', exact: true }).click()
  await page.getByLabel('Starts').fill('2027-05-01T18:00')
  await page.getByLabel('Ends').fill('2027-05-01T21:00')
  await page.getByLabel('Location').fill('Berlin')
  await page.getByRole('checkbox').check()
  await page.getByLabel('Ticket price (USD)').fill('15')
  await page.getByLabel('Tickets available').fill('10')
  await page.getByRole('button', { name: 'Create event' }).click()

  // Wait for the detail page (not /events/new) before capturing its URL.
  await expect(page.getByRole('heading', { name: `Paid Event ${suffix}` })).toBeVisible()
  const eventUrl = page.url()
  // Owner sees the price badge.
  await expect(page.getByText('$15.00')).toBeVisible()

  // A different user sees a Buy button.
  await page.getByRole('button', { name: 'Sign out' }).click()
  await page.waitForURL('**/login')
  await signupFresh(page, suffix)
  await page.goto(eventUrl)
  await expect(page.getByRole('button', { name: /Buy ticket \(\$15\.00\)/ })).toBeVisible()
})
