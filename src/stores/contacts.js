import { api } from '@/utils/api'
import { defineStore } from 'pinia'

export const useContactStore = defineStore('contacts', {
  state: () => ({
    contacts: [],
    loading: false,
    error: null,
  }),
  getters: {
    getContacts: (state) => state.contacts,
    contactOptions: (state) => {
      return state.contacts.map((contact) => ({
        label: `${contact.name} (${contact.type})`,
        value: contact.id,
      }))
    },
  },
  actions: {
    async fetchContacts() {
      this.loading = true
      try {
        const response = await api.get('/api/v1/contacts')
        this.contacts = response.data
      } catch (error) {
        this.error = error
      } finally {
        this.loading = false
      }
    },
    async createContact(contact) {
      try {
        const response = await api.post('/api/v1/contacts', contact)
        this.contacts.push(response)
        return response
      } catch (error) {
        this.error = error
        throw error
      }
    },
    async updateContact(id, contact) {
      try {
        const response = await api.put(`/api/v1/contacts/${id}`, contact)
        const index = this.contacts.findIndex((c) => c.id === id)
        if (index !== -1) {
          this.contacts[index] = response
        }
        return response
      } catch (error) {
        this.error = error
        throw error
      }
    },
    async deleteContact(id) {
       try {
        await api.delete(`/api/v1/contacts/${id}`)
        this.contacts = this.contacts.filter((c) => c.id !== id)
      } catch (error) {
        this.error = error
        throw error
      }
    }
  },
})
