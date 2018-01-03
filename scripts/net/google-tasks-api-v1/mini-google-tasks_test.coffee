# mini-google-tasksのテスト

async = require('async')
path = require("path")
util = require('util')
GTasks = require('./mini-google-tasks').GTasks

scriptDir = __dirname
scriptName = path.basename __filename
baseName = path.basename __filename, path.extname(__filename)
d = new Date
dateStr = d.getFullYear()+('0'+(d.getMonth()+1)).slice(-2)+('0'+d.getDate()).slice(-2)
timeStr = ('0'+d.getHours()).slice(-2)+('0'+d.getMinutes()).slice(-2)+('0'+d.getSeconds()).slice(-2)
timestamp = dateStr+'-'+timeStr
infolog = util.log
debuglog = util.debuglog baseName

credentialDir = (process.env.HOME or process.env.USERPROFILE) + '/.credentials/'
oauth2ClientPath = credentialDir + 'client_secret.json'
readTokenPath = credentialDir + 'tasks.googleapis.com-nodejs-mini-read.json'
writeTokenPath = credentialDir + 'tasks.googleapis.com-nodejs-mini-write.json'
accessToken = null

testCase = process.argv[2]
accessToken = process.argv[3]
infolog "testCase=#{testCase}"

async.series [
  # OAuth2.0認証のテスト
  (step) =>
    if testCase? and not (testCase is 'OAuth2')
      step()
      return
    infolog "--- OAuth2.0認証のテスト"
    obj = new GTasks
    obj.useOAuth2 oauth2ClientPath, readTokenPath, false, (response) =>
      console.log "useOAuth2 response=#{util.inspect response}"
      obj.listTasklists (response) =>
        console.log "response.items.length=#{response.items.length}"

        infolog "--- アクセストークンのリフレッシュ（Read only）"
        obj.refreshAccessToken (response) =>
          console.log "response=#{util.inspect response}"
          accessToken = response.access_token

          infolog "--- アクセストークンのリフレッシュ（Read and write）"
          obj2 = new GTasks
          obj2.useOAuth2 oauth2ClientPath, writeTokenPath, true, (response) =>
            obj2.refreshAccessToken (response) =>
              console.log "response=#{util.inspect response}"
              step()

  # 入手済みアクセストークン使用のテスト
  , (step) =>
    if testCase? and not (testCase is 'AccessToken')
      step()
      return
    infolog "--- 入手済みアクセストークン使用のテスト"
    obj = new GTasks
    obj.useAccessToken accessToken, () =>
      obj.listTasklists (response) =>
        console.log "response.items.length=#{response.items.length}"
        step()

  # Googleタスク読み込みのテスト
  , (step) =>
    if testCase? and not (testCase is 'Read')
      step()
      return
    infolog "--- Googleタスク読み込みのテスト"
    obj = new GTasks
    obj.useOAuth2 oauth2ClientPath, readTokenPath, false, () =>

      infolog "--- タスクリスト一覧の取得"
      obj.listTasklists (response) =>
        console.log "listTasklists response=#{util.inspect response}"

        infolog "--- タスクリストの抽出"
        obj.findTasklists 'TryNodeJs_Tasklist01', (response) =>
          console.log "findTasklist response=#{util.inspect response}"
          tasklist = response.items[0]

          infolog "--- タスク一覧の取得"
          obj.listTasks tasklist.id, {
            showCompleted: true
            showDeleted: true
            showHidden: true
          }, (response) =>
            console.log "listTasks response=#{util.inspect response}"

            infolog "--- タスクの抽出"
            obj.findTasks tasklist.id, 'Task01', null, (response) =>
              console.log "findTask response=#{util.inspect response}"
              step()

  # Googleタスク書き込みのテスト
  , (step) =>
    if testCase? and not (testCase is 'Write')
      step()
      return
    infolog "--- Googleタスク書き込みのテスト"
    obj = new GTasks
    obj.useOAuth2 oauth2ClientPath, writeTokenPath, true, () =>

      infolog "--- タスクリストの追加"
      tasklistTitle = "Tasklist #{timestamp}"
      obj.insertTasklist tasklistTitle, (response) =>
        console.log "insertTasklist response=#{util.inspect response}"
        tasklist = response

        infolog "--- タスクリストの更新"
        tasklist.title = "#{tasklist.title} Update"
        obj.updateTasklist tasklist, (response) =>
          console.log "updateTasklist response=#{util.inspect response}"
          tasklist = response

          infolog "--- タスクの追加"
          obj.insertTask tasklist.id, {
            title: "Task #{timestamp}"
            notes: 'Notes\ntest1\ntest2'
          }, (response) =>
            console.log "insertTask response=#{util.inspect response}"
            task = response

            infolog "--- タスクの更新"
            obj.updateTaskStatusToCompleted tasklist.id, task, (response) =>
              console.log "updateTaskStatusToCompleted response=#{util.inspect response}"
              step()

], (err) =>
  infolog err if err?
