import { defineStore } from 'pinia'
import axios from 'axios'

interface Post {
  userId: number
  id: number
  title: string
  body: string
}

export const usePostStore = defineStore('post', {
  state: () => ({
    posts: [] as Post[],
    localPosts: [] as Post[],
    loading: false,
    currentPage: 1,
    totalPages: 1,
    sortOrder: 'asc' as 'asc' | 'desc',
    nextId: 101
  }),
  actions: {
    async fetchPosts() {
      this.loading = true
      try {
        const response = await axios.get(`https://jsonplaceholder.typicode.com/posts`, {
          params: {
            _page: this.currentPage,
            _limit: 10,
            _sort: 'id',
            _order: this.sortOrder
          }
        })
        const apiPosts = response.data
        
        this.loadLocalPosts()
        
        // Обновляем nextId на основе всех постов
        const allPosts = [...apiPosts, ...this.localPosts]
        this.nextId = Math.max(...allPosts.map(post => post.id), 100) + 1
        
        this.posts = this.sortPosts(allPosts).slice(0, 10)
        
        const totalCount = Number(response.headers['x-total-count']) + this.localPosts.length
        this.totalPages = Math.ceil(totalCount / 10)
      } catch (error) {
        console.error('Ошибка при загрузке постов:', error)
      } finally {
        this.loading = false
      }
    },
    async createPost(post: Omit<Post, 'id'>) {
      this.loading = true
      try {
        await axios.post('https://jsonplaceholder.typicode.com/posts', post)
        
        const newPost: Post = {
          ...post,
          id: this.nextId++
        }
        
        this.localPosts.push(newPost)
        this.saveLocalPosts()
        
        this.posts = this.sortPosts([...this.posts, newPost]).slice(0, 10)
        
        this.totalPages = Math.ceil((this.totalPages * 10 + 1) / 10)
      } catch (error) {
        console.error('Ошибка при создании поста:', error)
      } finally {
        this.loading = false
      }
    },
    setPage(page: number) {
      this.currentPage = page
      this.fetchPosts()
    },
    toggleSortOrder() {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      this.fetchPosts()
    },
    loadLocalPosts() {
      const savedPosts = localStorage.getItem('localPosts')
      if (savedPosts) {
        this.localPosts = JSON.parse(savedPosts)
        // Обновляем nextId на основе локальных постов при загрузке
        this.nextId = Math.max(...this.localPosts.map(post => post.id), this.nextId)
      }
    },
    saveLocalPosts() {
      localStorage.setItem('localPosts', JSON.stringify(this.localPosts))
    },
    sortPosts(posts: Post[]): Post[] {
      return [...posts].sort((a, b) => {
        if (this.sortOrder === 'asc') {
          return a.id - b.id
        } else {
          return b.id - a.id
        }
      })
    }
  }
})