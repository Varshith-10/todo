const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const format = require('date-fns/format')
const isValid = require('date-fns/isValid')
const toDate = require('date-fns/toDate')
const databasePath = path.join(__dirname, 'todoApplication.db')

const app = express()

app.use(express.json())

let database = null

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

const checkQuery = async (request, response, next) => {
  const {search_q, category, priority, status, date} = request.query
  const {todoId} = request.params

  if (category !== undefined) {
    const categoryArray = ['WORK', 'HOME', 'LEARNING']
    const categoryArrayisin = categoryArray.includes(category)
    if (categoryArrayisin === true) {
      request.category = category
    } else {
      response.status(400)
      response.send('Invalid Todo Category')
      return
    }
  }

  if (priority !== undefined) {
    const priorityArray = ['HIGH', 'MEDIUM', 'LOW']
    const priorityinpriArray = priorityArray.includes(priority)
    if (priorityinpriArray === true) {
      request.priority = priority
    } else {
      response.status(400)
      response.send('Invalid Todo Priority')
      return
    }
  }

  if (status !== undefined) {
    const statusArray = ['TO DO', 'IN PROGRESS', 'DONE']
    const statusIsInArray = statusArray.includes(status)
    if (statusIsInArray === true) {
      request.status = status
    } else {
      response.status(400)
      response.send('Invalid Todo Status')
      return
    }
  }

  if (date !== undefined) {
    try {
      const myDate = new Date(date)
      const formatedDate = format(new Date(date), 'yyyy-MM-dd')
      const result = toDate(
        new Date(
          `${myDate.getFullYear()}-${
            myDate.getMonth() + 1
          }-${myDate.getDate()}`,
        ),
      )
      const isValidDate = await isValid(result)
      if (isValidDate === true) {
        request.date = formatedDate
      } else {
        response.status(400)
        response.send('Invalid Due Date')
      }
    } catch (e) {
      response.status(400)
      response.send('Invalid Due Date')
      return
    }
  }
  request.todoId = todoId
  request.search_q = search_q

  next()
}

const checkBody = async (request, response, next) => {
  const {id, todo, category, priority, status, date} = request.body
  const {todoId} = request.params

  if (category !== undefined) {
    const categoryArray = ['WORK', 'HOME', 'LEARNING']
    const categoryArrayisin = categoryArray.includes(category)
    if (categoryArrayisin === true) {
      request.category = category
    } else {
      response.status(400)
      response.send('Invalid Todo Category')
      return
    }
  }

  if (priority !== undefined) {
    const priorityArray = ['HIGH', 'MEDIUM', 'LOW']
    const priorityinpriArray = priorityArray.includes(priority)
    if (priorityinpriArray === true) {
      request.priority = priority
    } else {
      response.status(400)
      response.send('Invalid Todo Priority')
      return
    }
  }

  if (status !== undefined) {
    const statusArray = ['TO DO', 'IN PROGRESS', 'DONE']
    const statusIsInArray = statusArray.includes(status)
    if (statusIsInArray === true) {
      request.status = status
    } else {
      response.status(400)
      response.send('Invalid Todo Status')
      return
    }
  }

  if (date !== undefined) {
    try {
      const myDate = new Date(date)
      const formatedDate = format(new Date(date), 'yyyy-MM-dd')
      const result = toDate(
        new Date(
          `${myDate.getFullYear()}-${
            myDate.getMonth() + 1
          }-${myDate.getDate()}`,
        ),
      )
      const isValidDate = await isValid(result)
      if (isValidDate === true) {
        request.date = formatedDate
      } else {
        response.status(400)
        response.send('Invalid Due Date')
      }
    } catch (e) {
      response.status(400)
      response.send('Invalid Due Date')
      return
    }
  }
  request.todoId = todoId
  request.id = id
  request.todo = todo

  next()
}

app.get('/todos/', checkQuery, async (request, response) => {
  const {status = '', category = '', priority = '', search_q = ''} = request
  const getTodo = `SELECT id, todo, priority, status, category, due_date AS dueDate FROM todo 
  WHERE todo LIKE '%${search_q}%' AND status LIKE '%${status}%' AND category LIKE '%${category}%' AND priority LIKE '%${priority}%';`
  const resGet = await database.all(getTodo)
  response.send(resGet)
})

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getTodoId = `SELECT id, todo, priority, status, category, due_date AS dueDate FROM todo WHERE id = ${todoId};`
  const resTodoId = await database.get(getTodoId)
  response.send(resTodoId)
})

app.get('/agenda/', checkQuery, async (request, response) => {
  const {date} = request
  const getAgenda = `SELECT id, todo, priority, status, category, due_date AS dueDate FROM todo WHERE due_date = ${date};`
  const resGetAgenda = await database.all(getAgenda)
  if (resGetAgenda === undefined) {
    response.status(400)
    response.send('Invalid Due Date')
  } else {
    response.send(resGetAgenda)
  }
})

app.post('/todos/', checkBody, async (request, response) => {
  const {id, todo, category, priority, status, dueDate} = request
  const postTodo = `INSERT INTO todo (id, todo, priority, status, category, due_date) 
  VALUES (${id}, '${todo}', '${priority}', '${status}', '${dueDate}');`
  const resPost = await database.run(postTodo)
  response.send('Todo Successfully Added')
})

app.put('/todos/:todoId/', checkBody, async (request, response) => {
  const {todoId} = request
  const {priority, todo, status, category, dueDate} = request
  let putTodoId = ''
  switch (true) {
    case priority !== undefined:
      putTodoId = `UPDATE todo SET priority = '${priority}' WHERE id = ${todoId};`
      await database.run(putTodoId)
      response.send('Priority Updated')
      break

    case todo !== undefined:
      putTodoId = `UPDATE todo SET todo = '${todo}' WHERE id = ${todoId};`
      await database.run(putTodoId)
      response.send('Todo Updated')
      break

    case status !== undefined:
      putTodoId = `UPDATE todo SET status = '${status}' WHERE id = ${todoId};`
      await database.run(putTodoId)
      response.send('Status Updated')
      break

    case category !== undefined:
      putTodoId = `UPDATE todo SET category = '${category}' WHERE id = ${todoId};`
      await database.run(putTodoId)
      response.send('Category Updated')
      break

    case dueDate !== undefined:
      putTodoId = `UPDATE todo SET due_date = '${dueDate}' WHERE id = ${todoId};`
      await database.run(putTodoId)
      response.send('Due Date Updated')
      break
  }
})

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteTodoId = `DELETE FROM todo WHERE id = ${todoId};`
  const resDel = await database.run(deleteTodoId)
  response.send('Todo Deleted')
})

module.exports = app
