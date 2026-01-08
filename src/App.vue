<script setup>
import { RouterView } from 'vue-router'
import AdminLayout from './components/layout/AdminLayout.vue'
import CompanyGate from './components/layout/CompanyGate.vue'
</script>

<template>
  <CompanyGate>
    <AdminLayout>
      <RouterView />
    </AdminLayout>
  </CompanyGate>
</template>
