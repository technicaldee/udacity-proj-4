import { createLogger } from '../utils/logger'
import { TodosAccess } from './todosAccess'

// TODO: Implement the fileStogare logic

const todoAccess = new TodosAccess()
const logger = createLogger('todos')

export async function GenerateUploadUrl(todoId: string): Promise<string> {
  logger.info('In GenerateUploadUrl() function')
  return await todoAccess.GenerateUploadUrl(todoId)
}