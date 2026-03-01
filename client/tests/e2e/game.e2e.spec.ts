import { test, expect } from "@playwright/test";
import { createAndLoadGame } from "./testUtils.ts";

test.describe("Game Nite Real-Time Features", () => {
  test("Move message appears in chat for Number Guesser", async ({ browser }) => {
    // Create a Number Guesser game and join as two users
    const user1 = await browser.newPage();
    const user2 = await browser.newPage();
    const username1 = await createAndLoadGame(user1, user2, "guess", false, true);

    // Set the slider to 50 and submit the guess
    const slider = user1.getByRole("slider");
    await slider.fill("50");
    const submitButton = user1.getByRole("button", { name: "Submit Guess" });
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    // Wait for move message to appear in chat for both users
    await expect(user1.locator(".chatMoveContent")).toContainText("You 50");
    await expect(user2.locator(".chatMoveContent")).toContainText(`${username1} 50`);

    await user1.close();
    await user2.close();
  });

  test("Move message appears in chat and is styled", async ({ browser }) => {
    // Create a Nim game and join as two users
    const user1 = await browser.newPage();
    const user2 = await browser.newPage();
    const username1 = await createAndLoadGame(user1, user2, "nim", true, true);

    // Wait for the move button to be visible for user1
    const moveButton = user1.locator("text=Take two");
    await expect(moveButton).toBeVisible();
    // User 1 makes a move
    await moveButton.click();

    // Wait for move message to appear in chat for both users
    await expect(user1.locator(".chatMoveContent")).toContainText("You 2 tokens");
    await expect(user2.locator(".chatMoveContent")).toContainText(`${username1} 2 tokens`);
    await expect(user1.locator(".chatMove")).toHaveCSS("text-align", "center");

    await user1.close();
    await user2.close();
  });
});
