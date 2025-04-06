import * as nestedServer from './server-nested'

const notificationsCancelled = ({
  reason,
  requestId,
}: {
  reason: string
  requestId: number | string
}) => {
  // eslint-disable-next-line no-console
  console.log('Notification cancelled: ', requestId, reason)
}

export const server = {
  ...nestedServer,
  'notifications/cancelled': notificationsCancelled,
} as const
