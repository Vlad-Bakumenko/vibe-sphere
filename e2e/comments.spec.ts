import { test, expect, type Page } from '@playwright/test'

async function login(page: Page) {
  await page.goto('/login')
  await page.getByLabel('Email').fill('user1@test.test')
  await page.getByLabel('Password').fill('123456')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('**/feed')
}

test('adds a comment to a post', async ({ page }) => {
  await login(page)

  // Create a post to comment on.
  const postContent = `Commentable post ${Date.now()}`
  await page.getByPlaceholder("What's on your mind?").fill(postContent)
  await page.getByRole('button', { name: 'Post', exact: true }).click()

  const post = page.locator('article', { hasText: postContent })
  await expect(post).toBeVisible()

  // Open comments and add one.
  await post.getByRole('button', { name: 'Toggle comments' }).click()
  const commentText = `Nice one ${Date.now()}`
  await post.getByLabel('Comment', { exact: true }).fill(commentText)
  await post.getByRole('button', { name: 'Comment', exact: true }).click()

  await expect(post.getByText(commentText)).toBeVisible()
})
