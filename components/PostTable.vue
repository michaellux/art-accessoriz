<template>
    <div class="container mx-auto p-4">
        <div class="mb-4 flex justify-between items-center">
            <h1 class="text-2xl font-bold">Посты</h1>
            <button @click="openModal" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Новый пост
            </button>
        </div>
        <div v-if="loading" class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <table v-else class="min-w-full bg-white">
            <thead>
                <tr>
                    <th @click="toggleSortOrder" class="cursor-pointer py-2 px-4 border-b">ID {{ sortOrder === 'asc' ? '▲' : '▼' }}</th>
                    <th class="py-2 px-4 border-b">Заголовок</th>
                    <th class="py-2 px-4 border-b">Содержание</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="post in posts" :key="post.id" class="hover:bg-gray-100">
                    <td class="py-2 px-4 border-b">{{ post.id }}</td>
                    <td class="py-2 px-4 border-b">{{ post.title }}</td>
                    <td class="py-2 px-4 border-b">{{ post.body.slice(0, 50) }}...</td>
                </tr>
            </tbody>
        </table>
        <div class="mt-4 flex justify-center items-center">
            <button 
                v-for="page in totalPages" 
                :key="page" 
                @click="setPage(page)" 
                :disabled="loading"
                :class="[
                    'mx-1 px-3 py-1 rounded',
                    currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-200',
                    loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-200'
                ]"
            >
                {{ page }}
            </button>
            <div v-if="loading" class="ml-4">
                <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        </div>
        <teleport to="body">
            <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div class="bg-white p-4 rounded-lg w-1/2">
                    <h2 class="text-xl font-bold mb-4">Новый пост</h2>
                    <input v-model="newPost.title" class="w-full mb-2 p-2 border rounded" placeholder="Заголовок">
                    <textarea v-model="newPost.body" class="w-full mb-2 p-2 border rounded" placeholder="Содержание"></textarea>
                    <div class="flex justify-end">
                        <button @click="closeModal" class="mr-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Отмена</button>
                        <button @click="createPost" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Создать</button>
                    </div>
                </div>
            </div>
        </teleport>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted } from 'vue'
    import { storeToRefs } from 'pinia'
    import { usePostStore } from '../stores/posts'

    const postStore = usePostStore()
    const showModal = ref(false)
    const newPost = ref({ title: '', body: '', userId: 1 })

    const { posts, loading, currentPage, totalPages, sortOrder } = storeToRefs(postStore)
    const { setPage, toggleSortOrder, createPost: storeCreatePost } = postStore

    onMounted(() => {
        postStore.fetchPosts()
    })

    const openModal = () => {
        showModal.value = true
    }

    const closeModal = () => {
        showModal.value = false
        newPost.value = { title: '', body: '', userId: 1 }
    }

    const createPost = async () => {
        await storeCreatePost(newPost.value)
        closeModal()
        // Сбрасываем форму
        newPost.value = { title: '', body: '', userId: 1 }
    }
</script>
