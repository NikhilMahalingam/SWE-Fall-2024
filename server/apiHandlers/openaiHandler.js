import 'dotenv/config';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generatePCBuild(inputDescription) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that creates PC builds based on user descriptions in JSON format.' },
        { role: 'user', content: `Generate a PC build with a CPU, Storage_Device, GPU, Motherboard, Computer_case, and Cooling component based on the following requirement: ${inputDescription}. Give only the model name and brand for all components.` },
      ],
    });

    return completion.choices[0].message.content; // Generated response
  } catch (error) {
    console.error('Error generating PC build:', error);
    throw error;
  }
}
