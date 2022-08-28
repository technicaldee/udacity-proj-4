import { TodosAccess } from '../dataLayer/todosAcess'
// import { AttachmentUtils } from './attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'

// TODO: Implement businessLogic
const todoAccess = new TodosAccess()
const logger = createLogger('todos')

export async function GetTodos(userId: string): Promise<TodoItem[]> {
  logger.info('In GetTodo() function')
  return await todoAccess.GetTodos(userId)
}

export async function CreateTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  logger.info('In CreateTodo() function')
  const todoId = uuid.v4()

  return await todoAccess.CreateTodo({
    userId: userId,
    todoId: todoId,
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: '',
    done: false
  })
}

export async function UpdateTodo(
  todoId: string,
  updatedTodo: UpdateTodoRequest,
  userId: string
): Promise<string> {
  logger.info('In UpdateTodo() function')
  return await todoAccess.UpdateTodo({
    userId: userId,
    todoId: todoId,
    createdAt: new Date().toISOString(),
    name: updatedTodo.name,
    dueDate: updatedTodo.dueDate,
    done: updatedTodo.done
  })
}

export async function DeleteTodo(
  todoId: string,
  userId: string
): Promise<string> {
  logger.info('In DeleteTodo() function')
  return await todoAccess.DeleteTodo(todoId, userId)
}