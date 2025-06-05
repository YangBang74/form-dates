// src/stores/useAccountsStore.ts
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

// === Типы ===
export type AccountType = 'Локальная' | 'LDAP' | 'Другая'

export interface LabelItem {
  text: string
}

export interface RawAccount {
  id: string
  labelsStr: string // строка с метками, разделённая ';'
  type: AccountType
  login: string
  password: string
}

export interface Account {
  id: string
  labels: LabelItem[]
  type: AccountType
  login: string
  password: string
}

// === Store ===
export const useAccountsStore = defineStore('accounts', () => {
  // Сырые записи, которые храним в localStorage / Pinia (labelsStr хранится как строка)
  const rawAccounts = ref<RawAccount[]>([])

  // Функция, которая превращает rawAccounts → готовые объекты Account с массивом меток
  function getAccounts(): Account[] {
    return rawAccounts.value.map((ra) => ({
      id: ra.id,
      labels: ra.labelsStr
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((s) => ({ text: s })),
      type: ra.type,
      login: ra.login,
      password: ra.password,
    }))
  }

  // Загрузка из localStorage при старте
  function loadFromLocalStorage() {
    const json = localStorage.getItem('accounts_store')
    if (json) {
      try {
        rawAccounts.value = JSON.parse(json)
      } catch {
        rawAccounts.value = []
      }
    }
  }

  // Автоматическое сохранение в localStorage при изменении rawAccounts
  watch(
    rawAccounts,
    (newVal) => {
      localStorage.setItem('accounts_store', JSON.stringify(newVal))
    },
    { deep: true },
  )

  // Добавить новую пустую запись. Генерируем id через Date.now().
  function addAccount() {
    const newId = Date.now().toString() // можно добавить суффикс: `${Date.now()}_${Math.random().toString(36).substr(2,5)}`
    rawAccounts.value.push({
      id: newId,
      labelsStr: '',
      type: 'Локальная',
      login: '',
      password: '',
    })
  }

  // Обновить одно поле (labelsStr, type, login или password) у записи с указанным id
  function updateAccountField(id: string, field: keyof Omit<RawAccount, 'id'>, value: string) {
    const idx = rawAccounts.value.findIndex((a) => a.id === id)
    if (idx !== -1) {
      rawAccounts.value[idx] = {
        ...rawAccounts.value[idx],
        [field]: value,
      }
    }
  }

  // Удалить запись по id
  function removeAccount(id: string) {
    rawAccounts.value = rawAccounts.value.filter((a) => a.id !== id)
  }

  // При инициализации подгружаем из localStorage
  loadFromLocalStorage()

  return {
    rawAccounts,
    getAccounts,
    addAccount,
    updateAccountField,
    removeAccount,
  }
})
