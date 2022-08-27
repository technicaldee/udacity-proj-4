import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo, getTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId, parseUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    // TOD0: Update a TODO item with the provided id using values in the "updatedTodo" object
  
    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]
  
    const userId = parseUserId(jwtToken)
  
    const todo = await getTodo(todoId)
  
    if (todo && todo.userId === userId) {
      const result = await updateTodo(todo, updatedTodo)
  
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(result)
      }
    }
  
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: 'Failed to update. Item not found or user do not own item.'
    }
  })

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
