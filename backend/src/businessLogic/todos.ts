import { TodosAccess } from '../data/todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { AttachmentUtil } from '../fileManagement/attachmentUtils'
import { QxtraQueryParam } from '../models/ExtraQueryParam'

// BusinessLogic for todo app

const todosAccess = new TodosAccess()
const attachmentUtil = new AttachmentUtil()

const logger = createLogger('BusinessLogic')

async function checkUserCanAccessTodo(userId: string, todoId: string) {
  if (!userId) {
    // user not found
    logger.info('[checkUserCanAccessTodo] user is not found.', { userId })
    throw new Error(`User (${userId}) not found`)
  }

  if (!todoId) {
    // todoId not found
    logger.info('[checkUserCanAccessTodo] todoId not found.', { todoId })
    throw new Error(`Todo ${todoId} not found`)
  }

  const currentTodo = await todosAccess.getTodoById(userId, todoId)

  if (currentTodo.userId !== userId) {
    // user not permited to update other users todo
    logger.info('[checkUserCanAccessTodo] user is not able to access todo.', {
      userId,
      currentTodo
    })
    throw new Error(
      `User (${userId}) not authorised to access todo: ${currentTodo.todoId}`
    )
  }

  return true
}

export async function getTodoById(
  userId: string,
  todoId: string
): Promise<TodoItem> {
  return todosAccess.getTodoById(userId, todoId)
}

export async function getTodosForUser(
  userId: string,
  extraQueryParam: QxtraQueryParam = {}
) {
  return todosAccess.getAllTodosByUser(userId, extraQueryParam)
}

export async function createTodo(
  userId: string,
  todoBody: CreateTodoRequest
): Promise<TodoItem> {
  const todoId = uuid.v4()

  const newTodoObj: TodoItem = {
    todoId,
    userId,
    name: todoBody.name,
    dueDate: todoBody.dueDate,
    createdAt: new Date().toISOString(),
    done: false,
    // attachmentUrl would be added later
  }

  return todosAccess.createTodo(newTodoObj)
}

export async function updateTodo(
  userId: string,
  todoId: string,
  todoBody: UpdateTodoRequest
): Promise<void> {
  await checkUserCanAccessTodo(userId, todoId)

  return todosAccess.updateTodo(userId, todoId, todoBody)
}

export async function deleteTodo(userId: string, todoId: string) {
  await checkUserCanAccessTodo(userId, todoId)

  const todoDeleted = await todosAccess.deleteTodo(userId, todoId)

  logger.info('[BL > deleteTodo] todoDeleted: ', todoDeleted)

  if (!todoDeleted) return false

  const checkForTodoAttachment = await attachmentUtil.getTodoAttachment(userId, todoId)

  logger.info(
    '[BL > deleteTodo] checkForTodoAttachment: ',
    checkForTodoAttachment
  )

  if (checkForTodoAttachment) {
    // when a todo item is deleted, remove the todo Attachment
    const deletedAttachment = await attachmentUtil.deleteTodoAttachment(userId, todoId)

    logger.info('[BL > deleteTodo] deletedAttachment: ', deletedAttachment)
  }

  return true
}

export async function createAttachmentPresignedUrl(
  userId: string,
  todoId: string
) {
  await checkUserCanAccessTodo(userId, todoId)

  return attachmentUtil.getUploadUrl(userId, todoId)
}
