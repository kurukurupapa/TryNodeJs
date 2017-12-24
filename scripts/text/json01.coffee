# Jsonを読み込んでみる。

func01 = (jsonobj) ->
  console.log '---'
  console.log jsonobj
  console.log "number1=#{jsonobj.number1}"
  console.log "string1=#{jsonobj.string1}"
  console.log "array1[0]=#{jsonobj.array1[0]}"
  console.log "hash1.key1=#{jsonobj.hash1.key1}"
  console.log "hash1['key1']=#{jsonobj.hash1['key1']}"
  console.log "javascript1=#{jsonobj.javascript1}"
  eval jsonobj.javascript1

jsonobj = require './data/json01'
func01 jsonobj

fs = require 'fs'
jsonstr = fs.readFileSync './data/json01.json', 'utf8'
jsonobj = JSON.parse jsonstr
func01 jsonobj
