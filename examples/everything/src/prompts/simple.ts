import { definePrompt } from '@xsmcp/server-shared'

export const simple = definePrompt({
  description: 'A prompt without arguments',
  execute: () => [
    {
      content: {
        text: 'This is a simple prompt without arguments.',
        type: 'text',
      },
      role: 'user',
    },
  ],
  name: 'simple_prompt',
})
