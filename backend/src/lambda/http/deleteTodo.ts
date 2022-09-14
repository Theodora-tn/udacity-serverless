import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { deleteTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { TodosAccess } from '../../dataLayer/TodosAccess'



const logger = createLogger('deleteTodo')
const todosAccess = new TodosAccess()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing deleteTodo event', { event })

  const userId = getUserId(event)
  const todoId = event.pathParameters.todoId
  const item = await todosAccess.getTodoItem(todoId)
  const itemKey = item.attachmentUrl

  logger.info(`itemPath in http ${itemKey}`, {itemKey})
  await deleteTodo(userId,todoId)

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  }
}
