<script setup>
import { Edit2, Plus, Search, Trash2, X } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import FormAlert from '../components/ui/FormAlert.vue'
import InputError from '../components/ui/InputError.vue'
import { useContactStore } from '../stores/contacts'

const store = useContactStore()
const showModal = ref(false)
const isEditing = ref(false)
const searchQuery = ref('')

const form = ref({
  id: null,
  name: '',
  type: 'customer',
  email: '',
  phone: '',
  address: '',
  notes: '',
})

const errors = ref({})
const successMessage = ref('')

function resetForm() {
  form.value = {
    id: null,
    name: '',
    type: 'customer',
    email: '',
    phone: '',
    address: '',
    notes: '',
  }
  errors.value = {}
  isEditing.value = false
  successMessage.value = ''
}

function openModal(contact = null) {
  resetForm()
  if (contact) {
    form.value = { ...contact }
    isEditing.value = true
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  resetForm()
}

async function handleSubmit() {
  errors.value = {}
  try {
    if (isEditing.value) {
      await store.updateContact(form.value.id, form.value)
      successMessage.value = 'Contact updated successfully'
    } else {
      await store.createContact(form.value)
      successMessage.value = 'Contact created successfully'
    }
    setTimeout(() => {
      closeModal()
      store.fetchContacts()
    }, 1000)
  } catch (error) {
    if (error.response && error.response.data && error.response.data.errors) {
      errors.value = error.response.data.errors
    } else {
      errors.value = { general: [error.message] }
    }
  }
}

async function handleDelete(id) {
  if (confirm('Are you sure you want to delete this contact?')) {
    await store.deleteContact(id)
  }
}

const filteredContacts = computed(() => {
  if (!searchQuery.value) return store.contacts
  const lower = searchQuery.value.toLowerCase()
  return store.contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(lower) ||
      c.email?.toLowerCase().includes(lower) ||
      c.phone?.includes(lower),
  )
})

onMounted(() => {
  store.fetchContacts()
})
</script>

<template>
  <div class="max-w-6xl mx-auto p-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Contacts</h1>
        <p class="text-sm text-gray-500">Manage customers, vendors, and employees</p>
      </div>
      <button
        @click="openModal()"
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus class="w-4 h-4" />
        Add Contact
      </button>
    </div>

    <div class="card p-4 mb-6">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search contacts..."
          class="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
        />
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <table class="w-full text-left text-sm text-gray-600 dark:text-gray-300">
        <thead
          class="bg-gray-50 dark:bg-gray-700 text-xs uppercase font-medium text-gray-500 dark:text-gray-400"
        >
          <tr>
            <th class="px-6 py-3">Name</th>
            <th class="px-6 py-3">Type</th>
            <th class="px-6 py-3">Contact Info</th>
            <th class="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="contact in filteredContacts"
            :key="contact.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">{{ contact.name }}</td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 capitalize">
                {{ contact.type }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex flex-col gap-1">
                <span v-if="contact.email" class="text-xs">{{ contact.email }}</span>
                <span v-if="contact.phone" class="text-xs">{{ contact.phone }}</span>
              </div>
            </td>
            <td class="px-6 py-4 text-right flex justify-end gap-2">
              <button @click="openModal(contact)" class="p-1 hover:text-blue-600">
                <Edit2 class="w-4 h-4" />
              </button>
              <button @click="handleDelete(contact.id)" class="p-1 hover:text-red-600">
                <Trash2 class="w-4 h-4" />
              </button>
            </td>
          </tr>
          <tr v-if="filteredContacts.length === 0">
            <td colspan="4" class="px-6 py-8 text-center text-gray-500">No contacts found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div class="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h3 class="text-lg font-semibold">{{ isEditing ? 'Edit Contact' : 'New Contact' }}</h3>
          <button
            @click="closeModal"
            class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-6 space-y-4">
          <FormAlert :message="successMessage" type="success" />
          <FormAlert :message="errors.general?.[0]" type="error" />

          <div>
            <label class="block text-sm font-medium mb-1">Name *</label>
            <input
              v-model="form.name"
              type="text"
              class="w-full border rounded-lg p-2 dark:bg-gray-900 dark:border-gray-700"
            />
            <InputError :message="errors.name?.[0]" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Type *</label>
            <select
              v-model="form.type"
              class="w-full border rounded-lg p-2 dark:bg-gray-900 dark:border-gray-700"
            >
              <option value="customer">Customer</option>
              <option value="vendor">Vendor</option>
              <option value="employee">Employee</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Email</label>
              <input
                v-model="form.email"
                type="email"
                class="w-full border rounded-lg p-2 dark:bg-gray-900 dark:border-gray-700"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Phone</label>
              <input
                v-model="form.phone"
                type="text"
                class="w-full border rounded-lg p-2 dark:bg-gray-900 dark:border-gray-700"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Address</label>
            <textarea
              v-model="form.address"
              rows="2"
              class="w-full border rounded-lg p-2 dark:bg-gray-900 dark:border-gray-700"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Notes</label>
            <textarea
              v-model="form.notes"
              rows="2"
              class="w-full border rounded-lg p-2 dark:bg-gray-900 dark:border-gray-700"
            ></textarea>
          </div>
        </div>

        <div
          class="p-4 border-t dark:border-gray-700 flex justify-end gap-2 bg-gray-50 dark:bg-gray-900/50"
        >
          <button @click="closeModal" class="px-4 py-2 text-gray-600 hover:text-gray-900">
            Cancel
          </button>
          <button
            @click="handleSubmit"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {{ isEditing ? 'Save Changes' : 'Create Contact' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
