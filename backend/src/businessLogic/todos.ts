import 'source-map-support/register'

import * as uuid from 'uuid'

import { TodosAccess } from '../dataLayer/TodosAccess'
import { TodosStorage } from '../dataLayer/TodosStorage'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'

const logger = createLogger('todos')

const todosAccess = new TodosAccess()
const todosStorage = new TodosStorage()

export async function getTodos(userId: string): Promise<TodoItem[]> {
  logger.info(`Retrieving all todos for user ${userId}`, { userId })

  return await todosAccess.getTodoItems(userId)
}

export async function createTodoItem(userId: string, createTodoRequest: CreateTodoRequest): Promise<TodoItem> {
  const todoId = uuid.v4()

  const newItem: TodoItem = {
    userId,
    todoId: uuid.v4(),
    done: false,
    // attachmentUrl: null,
    createdAt: new Date().toISOString(),
    ...createTodoRequest
  }

  logger.info(`Creating todo ${todoId} for user ${userId}`, { userId, todoId, todoItem: newItem })

  await todosAccess.createTodoItem(newItem)

  return newItem
}

export async function updateTodo(userId: string, todoId: string, updateTodoRequest: UpdateTodoRequest) {

  const item = await todosAccess.getTodoItem(todoId)

  if (!item)
    throw new Error('Item not found')  // FIXME: 404?

  if (item.userId !== userId) {
    logger.error(`User ${userId} does not have permission to update todo ${todoId}`)
    throw new Error('User is not authorized to update item')  // FIXME: 403?
  }

  todosAccess.updateTodoItem(todoId, updateTodoRequest as TodoUpdate)
}

export async function deleteTodo(userId: string, todoId: string) {
  // logger.info(`Deleting todo ${todoId} for user ${userId}`, { userId, todoId, itemKey })

  const item = await todosAccess.getTodoItem(todoId)

  if (!item)
    throw new Error('Item not found') 

  if (item.userId !== userId) {
    throw new Error('User is not authorized to delete item')  
  }
  await todosAccess.deleteTodoItem(todoId)

  // await Promise.all([
  //   todosAccess.deleteTodoItem(userId),
  //   todosStorage.deleteTodoItemAttachment(itemKey)
  // ]) 
}

export async function updateAttachmentUrl(userId: string, todoId: string, attachmentId: string) {
  logger.info(`Generating attachment URL for attachment ${attachmentId}`)

  const attachmentUrl = await todosStorage.getAttachmentUrl(attachmentId)

  const item = await todosAccess.getTodoItem(todoId)

  if (!item)
    throw new Error('Item not found') 

  if (item.userId !== userId) {
    throw new Error('User is not authorized to update item') 
  }

  await todosAccess.updateAttachmentUrl(todoId, attachmentUrl)
}

export async function generateUploadUrl(attachmentId: string): Promise<string> {

  const uploadUrl = await todosStorage.getUploadUrl(attachmentId)

  return uploadUrl
}
