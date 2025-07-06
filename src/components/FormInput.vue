<script setup lang="ts">
import { ref, reactive, watch, nextTick, defineExpose } from 'vue'
import { useAccountsStore } from '@/stores/accountStore'
import { Icon } from '@iconify/vue'
import type { RawAccount } from '@/stores/accountStore'

interface Props {
  rawAccount: RawAccount
}
const props = defineProps<Props>()

const accountsStore = useAccountsStore()

const tags = ref<string[]>(
  props.rawAccount.labelsStr
    .split(';')
    .map((t) => t.trim())
    .filter((t) => t.length > 0),
)
const newTag = ref('')

const tagInputRef = ref<HTMLInputElement | null>(null)

const typeValue = ref(props.rawAccount.type)
const loginValue = ref(props.rawAccount.login)
const passwordValue = ref(props.rawAccount.password)

const errors = reactive({
  labels: false,
  type: false,
  login: false,
  password: false,
})
const labelsErrorMessage = ref('')

const showPassword = ref(false)

watch(
  () => props.rawAccount,
  (newRaw) => {
    tags.value = newRaw.labelsStr
      .split(';')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
    newTag.value = ''
    typeValue.value = newRaw.type
    loginValue.value = newRaw.login
    passwordValue.value = newRaw.password

    errors.labels = false
    errors.type = false
    errors.login = false
    errors.password = false
    labelsErrorMessage.value = ''
    showPassword.value = false
  },
  { deep: true },
)

function parseTags(raw: string): string[] {
  const parts = raw
    .split(';')
    .map((t) => t.trim())
    .filter((t) => t.length > 0)

  const seen = new Set<string>()
  const unique: string[] = []
  for (const p of parts) {
    const lower = p.toLowerCase()
    if (!seen.has(lower)) {
      seen.add(lower)
      unique.push(p)
    }
  }
  return unique
}

function saveTagsToStore() {
  const joined = tags.value.join(';')
  accountsStore.updateAccountField(props.rawAccount.id, 'labelsStr', joined)
}

function addTag(candidateRaw: string) {
  const candidate = candidateRaw.trim()
  if (!candidate) {
    newTag.value = ''
    errors.labels = false
    labelsErrorMessage.value = ''
    return
  }

  if (candidate.length > 50) {
    errors.labels = true
    labelsErrorMessage.value = 'Метка не должна превышать 50 символов'
    return
  }

  const lowerList = tags.value.map((t) => t.toLowerCase())
  if (lowerList.includes(candidate.toLowerCase())) {
    errors.labels = true
    labelsErrorMessage.value = 'Такая метка уже добавлена'
    return
  }

  tags.value.push(candidate)
  newTag.value = ''
  errors.labels = false
  labelsErrorMessage.value = ''
  saveTagsToStore()

  nextTick(() => {
    tagInputRef.value?.focus()
  })
}

function handleEnter() {
  addTag(newTag.value.replace(/;$/, ''))
}

function onTagInput(e: InputEvent) {
  const val = (e.target as HTMLInputElement).value
  if (val.endsWith(';')) {
    addTag(val.slice(0, -1))
  }
}

function onTagBlur() {
  if (newTag.value.trim() !== '') {
    addTag(newTag.value)
  }
}

function handleBackspace(e: KeyboardEvent) {
  if (newTag.value === '' && tags.value.length > 0) {
    e.preventDefault()
    tags.value.pop()
    errors.labels = false
    labelsErrorMessage.value = ''
    saveTagsToStore()
  }
}

function focusTagInput() {
  tagInputRef.value?.focus()
}

function focusFirstInput() {
  tagInputRef.value?.focus()
}
defineExpose({ focusFirstInput })

function onTypeChange() {
  errors.type = false
  if (typeValue.value === 'LDAP') {
    passwordValue.value = ''
    errors.password = false
    accountsStore.updateAccountField(props.rawAccount.id, 'password', '')
  }
  accountsStore.updateAccountField(props.rawAccount.id, 'type', typeValue.value)
}

function validateAndSaveField(field: 'login' | 'password') {
  errors[field] = false
  const current = field === 'login' ? loginValue.value : passwordValue.value

  if (field === 'password' && typeValue.value !== 'Локальная') {
    errors.password = false
    return
  }
  if (!current || current.trim() === '') {
    errors[field] = true
    return
  }
  if (current.length > 100) {
    errors[field] = true
    return
  }
  accountsStore.updateAccountField(props.rawAccount.id, field, current.trim())
}

function onRemove() {
  accountsStore.removeAccount(props.rawAccount.id)
}

function toggleShowPassword() {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <tr class="hover:bg-gray-50 transition-colors">
    <td class="px-3 py-2 align-top">
      <div
        class="flex flex-wrap items-center min-h-[2.5rem] px-2 py-1 border rounded-md focus-within:ring-1 focus-within:ring-blue-300"
        :class="errors.labels ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'"
        @click="focusTagInput"
      >
        <template v-for="(tag, idx) in tags" :key="`${props.rawAccount.id}-tag-${idx}`">
          <span class="mr-1 mb-1 text-sm">
            {{ tag }}
            <span class="ml-0.5 cursor-pointer text-gray-600 hover:text-red-500"> ; </span>
          </span>
        </template>
        <input
          ref="tagInputRef"
          v-model="newTag"
          @keydown.enter.prevent="handleEnter"
          @keydown.backspace="handleBackspace"
          @input="onTagInput"
          @blur="onTagBlur"
          class="flex-1 min-w-[5rem] border-none focus:outline-none text-sm"
          type="text"
        />
      </div>
    </td>
    <td class="px-3 py-2 whitespace-nowrap">
      <select
        v-model="typeValue"
        @change="onTypeChange"
        :class="[
          'w-full px-2 py-1 border rounded-md focus:outline-none text-sm',
          errors.type ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white',
        ]"
      >
        <option value="Локальная">Локальная</option>
        <option value="LDAP">LDAP</option>
      </select>
    </td>
    <template v-if="typeValue === 'LDAP'">
      <td class="px-3 py-2 whitespace-nowrap" :class="['text-sm px-2 rounded-md ']" colspan="2">
        <input
          v-model="loginValue"
          @blur="() => validateAndSaveField('login')"
          :class="[
            'w-full px-2 py-1 border rounded-md focus:outline-none text-sm',
            errors.login ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white',
          ]"
          type="text"
        />
      </td>
    </template>
    <template v-else>
      <td class="px-3 py-2 whitespace-nowrap">
        <input
          v-model="loginValue"
          @blur="() => validateAndSaveField('login')"
          :class="[
            'w-full px-2 py-1 border rounded-md focus:outline-none text-sm',
            errors.login ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white',
          ]"
          type="text"
        />
      </td>

      <td class="px-3 py-2 relative whitespace-nowrap">
        <input
          v-model="passwordValue"
          @blur="() => validateAndSaveField('password')"
          :type="showPassword ? 'text' : 'password'"
          :class="[
            'w-full px-2 py-1 border rounded-md focus:outline-none text-sm',
            errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white',
          ]"
        />
        <button
          type="button"
          @click="toggleShowPassword"
          class="absolute inset-y-0 right-5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <Icon :icon="showPassword ? 'akar-icons:eye' : 'akar-icons:eye-closed'" class="w-5 h-5" />
        </button>
      </td>
    </template>
    <td class="px-3 py-2 whitespace-nowrap text-center">
      <button
        @click="onRemove"
        class="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-red-50 transition-colors focus:outline-none"
        type="button"
      >
        <Icon icon="ic:round-delete-outline" class="w-5 h-5 text-red-500 hover:text-red-700" />
      </button>
    </td>
  </tr>
</template>
