'use server';
/**
 * @fileOverview An AI-powered FAQ assistant for UnMac.
 *
 * - getFaqAnswer - A function that answers user questions about UnMac.
 * - FaqQuestionInput - The input type for the getFaqAnswer function.
 * - FaqAnswerOutput - The return type for the getFaqAnswer function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FaqQuestionInputSchema = z.object({
  question: z.string().describe('The user\'s question about UnMac.'),
});
export type FaqQuestionInput = z.infer<typeof FaqQuestionInputSchema>;

const FaqAnswerOutputSchema = z.object({
  answer: z.string().describe('A conversational and accurate answer to the user\'s question.'),
});
export type FaqAnswerOutput = z.infer<typeof FaqAnswerOutputSchema>;

export async function getFaqAnswer(input: FaqQuestionInput): Promise<FaqAnswerOutput> {
  return aiPoweredFaqAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPoweredFaqAssistantPrompt',
  input: { schema: FaqQuestionInputSchema },
  output: { schema: FaqAnswerOutputSchema },
  prompt: `You are an AI-powered FAQ assistant for UnMac, a service designed to unblock MAC addresses on WiFi networks. Your goal is to provide conversational, concise, and accurate answers to user questions based on the information provided below.

Here is information about UnMac:

**Purpose:** UnMac provides a MAC address unblock service for WiFi networks, allowing users to unblock their MAC addresses through trial or paid plans.

**Core Features:**
-   **User Input Form:** Users input MAC Address, Device Name, select WiFi Provider (Jio, Airtel, BSNL), enter WiFi Name (SSID), and choose a plan (Free Trial or Paid).
-   **Trial Period Activation:** Offers a 15-minute free trial for unblocking, with a countdown timer upon activation.
-   **Payment System:** A paid plan costs ₹100 for 1 month. Users can upgrade to premium, and a payment success confirmation is displayed.
-   **User Dashboard:** After submission, displays submitted details, unblock status ('Processing' / 'Unblocked'), a countdown timer for trial users, and plan validity for paid users.
-   **Backend Logic:** Stores user input, validates MAC address format, handles trial vs. paid logic, and is designed for future API integration.
-   **Smart Troubleshooting Assistant:** An AI tool that analyzes submitted details to suggest context-aware troubleshooting steps or reasons for network blocking.
-   **Informational Content Pages:** Includes 'About Us', 'FAQ', and a 'Contact Form'.

**Pricing:**
-   Free Trial: 15 minutes.
-   Paid Plan: ₹100 for 1 month.

**Supported Networks:** Jio, Airtel, BSNL.

**Refund Policy:** Currently, specific details regarding a refund policy are not explicitly defined. Users can contact support for more information.

**Disclaimer:** This service works only with supported networks.

Based on the above information, answer the following question. If the question asks for information not covered here, state that you do not have that specific information.

Question: {{{question}}}

Answer:`,
});

const aiPoweredFaqAssistantFlow = ai.defineFlow(
  {
    name: 'aiPoweredFaqAssistantFlow',
    inputSchema: FaqQuestionInputSchema,
    outputSchema: FaqAnswerOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
