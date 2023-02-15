import AsyncStorage from '@react-native-async-storage/async-storage'

const partKeyPrefix = '@___PART___'
const partKeyPrefixRxp = /^@___PART___/
const keySplit = ','
const limit = 500000 
export interface ErrorCatch {
    message: Response
  }
const buildData = (key:string, value:string, datas:any) => {
  let valueStr = JSON.stringify(value)
  if (valueStr.length <= limit) return datas.push([key, valueStr])

  const partKeys = []
  for (let i = 0, len = Math.floor(valueStr.length / limit); i <= len; i++) {
    let partKey = `${partKeyPrefix}${key}${i}`
    partKeys.push(partKey)
    datas.push([partKey, valueStr.substring(i * limit, (i + 1) * limit)])
  }
  datas.push([key, `${partKeyPrefix}${partKeys.join(keySplit)}`])
  return datas
}

const handleGetData = (partKeys:any) => {
  partKeys = partKeys.replace(partKeyPrefixRxp, '').split(keySplit)

  return AsyncStorage.multiGet(partKeys).then(datas => {
    return JSON.parse(datas.map(data => data[1]).join(''))
  })
}

export const setData = async(key:string, value:string) => {
  const datas:any = []
  buildData(key, value, datas)

  try {
    await AsyncStorage.multiSet(datas)
  } catch (e:any) {
    // saving error
    console.log(e.message)
    throw e
  }
}

export const getData = async (key:string) => {
  let value
  try {
    value = await AsyncStorage.getItem(key)
  } catch (e:any) {
    // error reading value
    console.log(e.message)
    throw e
  }
  if (partKeyPrefixRxp.test(value as any)) {
    return handleGetData(value)
  } else if (value) value = JSON.parse(value)
  return value
}

export const removeData = async (key:string) => {
  let value
  try {
    value = await AsyncStorage.getItem(key)
  } catch (e:any) {
    // error reading value
    console.log(e.message)
    throw e
  }
  if (partKeyPrefixRxp.test(value as any)) {
    let partKeys = value!.replace(partKeyPrefixRxp, '').split(keySplit)
    partKeys.push(key)
    try {
      await AsyncStorage.multiRemove(partKeys)
    } catch (e:any) {
      // remove error
      console.log(e.message)
      throw e
    }
  } else {
    try {
      await AsyncStorage.removeItem(key)
    } catch (e:any) {
      // remove error
      console.log(e.message)
      throw e
    }
  }
}

export const getAllKeys = async() => {
  let keys
  try {
    keys = await AsyncStorage.getAllKeys()
  } catch (e:any) {
    // read key error
    console.log(e.message)
    throw e
  }

  return keys
}

export const getDataMultiple = async (keys:any) => {
  let datas:any
  try {
    datas = await AsyncStorage.multiGet(keys)
  } catch (e:any) {
    // read error
    console.log(e.message)
    throw e
  }
  const promises = []
  for (const data of datas) {
    if (partKeyPrefixRxp.test(data[1])) {
      promises.push(handleGetData(data[1]))
    } else {
      promises.push(Promise.resolve(data[1] ? JSON.parse(data[1]) : data[1]))
    }
  }
  return Promise.all(promises).then(values => {
    return datas.map(([key]: any, index:number) => ({ key, value: values[index] }))
  })
}

export const setDataMultiple = async (datas:any) => {
  const allData:any = []
  for (const { key, value } of datas) {
    buildData(key, value, allData)
  }
  try {
    await AsyncStorage.multiSet(allData)
  } catch (e:any) {
    // save error
    console.log(e.message)
    throw e
  }
}


export const removeDataMultiple = async (keys:any) => {
  if (!keys.length) return
  const datas = await AsyncStorage.multiGet(keys)
  let allKeys = []
  for (const [key, value] of datas) {
    allKeys.push(key)
    if (partKeyPrefixRxp.test(value as any)) {
      allKeys.push(...value!.replace(partKeyPrefixRxp, '').split(keySplit))
    }
  }
  try {
    await AsyncStorage.multiRemove(allKeys)
  } catch (e:any) {
    // remove error
    console.log(e.message)
    throw e
  }
}

export const clearAll = async() => {
  try {
    await AsyncStorage.clear()
  } catch (e:any) {
    // clear error
    console.log(e.message)
    throw e
  }
}