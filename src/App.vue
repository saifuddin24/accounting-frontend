<script setup>
import { RouterView } from 'vue-router'
import AdminLayout from './components/layout/AdminLayout.vue'
import ProfileGate from './components/layout/ProfileGate.vue'
</script>

<template>
  <ProfileGate>
    <AdminLayout>
      <RouterView />
    </AdminLayout>
  </ProfileGate>
</template>
