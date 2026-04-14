'use server';
/**
 * @fileOverview An AI-powered assistant to provide context-aware troubleshooting steps or reasons for network blocking.
 *
 * - smartTroubleshootingAssistant - A function that handles the smart troubleshooting process.
 * - SmartTroubleshootingAssistantInput - The input type for the smartTroubleshootingAssistant function.
 * - SmartTroubleshootingAssistantOutput - The return type for the smartTroubleshootingAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartTroubleshootingAssistantInputSchema = z.object({
  deviceName: z.string().describe('The name of the device for which troubleshooting is requested.'),
  wifiProvider: z.enum(['Jio', 'Airtel', 'BSNL']).describe('The WiFi provider of the network.').default('Jio'),
});
export type SmartTroubleshootingAssistantInput = z.infer<typeof SmartTroubleshootingAssistantInputSchema>;

const SmartTroubleshootingAssistantOutputSchema = z.object({
  troubleshootingSteps: z.array(z.string()).describe('A list of context-aware troubleshooting steps.'),
  reasonForBlocking: z.string().describe('A possible reason why the network might be blocked, if applicable.'),
});
export type SmartTroubleshootingAssistantOutput = z.infer<typeof SmartTroubleshootingAssistantOutputSchema>;

const smartTroubleshootingAssistantPrompt = ai.definePrompt({
  name: 'smartTroubleshootingAssistantPrompt',
  input: {schema: SmartTroubleshootingAssistantInputSchema},
  output: {schema: SmartTroubleshootingAssistantOutputSchema},
  prompt: `You are an AI-powered smart troubleshooting assistant for network connectivity issues, specifically related to MAC address unblocking. Your goal is to provide helpful, context-aware troubleshooting steps or explanations for why a user's network might be blocked.

Based on the user's device and WiFi provider details, provide a list of troubleshooting steps and a potential reason for the network blocking.

Device Name: {{{deviceName}}}
WiFi Provider: {{{wifiProvider}}}

Provide your response in a JSON object with two fields: "troubleshootingSteps" (an array of strings) and "reasonForBlocking" (a string).
`,
});

const smartTroubleshootingAssistantFlow = ai.defineFlow(
  {
    name: 'smartTroubleshootingAssistantFlow',
    inputSchema: SmartTroubleshootingAssistantInputSchema,
    outputSchema: SmartTroubleshootingAssistantOutputSchema,
  },
  async (input) => {
    const {output} = await smartTroubleshootingAssistantPrompt(input);
    if (!output) {
      throw new Error('No output received from the troubleshooting assistant prompt.');
    }
    return output;
  }
);

export async function smartTroubleshootingAssistant(
  input: SmartTroubleshootingAssistantInput
): Promise<SmartTroubleshootingAssistantOutput> {
  return smartTroubleshootingAssistantFlow(input);
}
