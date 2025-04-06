import { defineTool } from '@xsmcp/server-shared'
import { description, number, object, optional, pipe } from 'valibot'

export const longRunningOperation = defineTool({
  description: 'Echoes back the input',
  execute: async ({ duration: d, steps: s }) => {
    const duration = d ?? 10
    const steps = s ?? 5
    const stepDuration = duration / steps
    // const progressToken = request.params._meta?.progressToken

    for (let i = 1; i < steps + 1; i++) {
      await new Promise(resolve =>
        // eslint-disable-next-line @masknet/no-timer, @masknet/prefer-timer-id
        setTimeout(resolve, stepDuration * 1000),
      )

      // if (progressToken !== undefined) {
      //   await server.notification({
      //     method: 'notifications/progress',
      //     params: {
      //       progress: i,
      //       progressToken,
      //       total: steps,
      //     },
      //   })
      // }
    }
    return [{
      text: `Long running operation completed. Duration: ${duration} seconds, Steps: ${steps}.`,
      type: 'text',
    }]
  },
  name: 'long-running-operation',
  parameters: object({
    duration: pipe(
      optional(number()),
      description('Duration of the operation in seconds'),
    ),
    steps: pipe(
      optional(number()),
      description('Number of steps in the operation'),
    ),
  }),
})
