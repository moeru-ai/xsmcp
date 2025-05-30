import type { AudioPart, ImagePart, TextPart } from '@xsai/shared-chat'
import type { AudioContent, EmbeddedResource, ImageContent, TextContent } from '@xsmcp/shared'

export const toXSAIContent = (contents: (AudioContent | EmbeddedResource | ImageContent | TextContent)[]): (AudioPart | ImagePart | TextPart)[] =>
  // eslint-disable-next-line array-callback-return
  contents.map((content) => {
    switch (content.type) {
      case 'audio':
        return {
          input_audio: {
            data: content.data,
            format: content.mimeType === 'audio/wav'
              ? 'wav'
              // TODO: fallback
              : 'mp3',
          },
          type: 'input_audio',
        } satisfies AudioPart
      case 'image':
        return {
          image_url: { url: content.data },
          type: 'image_url',
        } satisfies ImagePart
      case 'resource':
        return {
          text: ('text' in content.resource
            ? content.resource.text
            // TODO: fallback
            : content.resource.blob
          ),
          type: 'text',
        } satisfies TextPart
      case 'text':
        return {
          text: content.text,
          type: 'text',
        } satisfies TextPart
    }
  })
