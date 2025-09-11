import { createRouter, createWebHistory } from 'vue-router'
import StyFinance from '@/components/STTT/StyFinance.vue'
import introPage from '@/components/STTT/IntroPage.vue'
import FundsPage from '@/components/STTT/FundsPage.vue'
const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', redirect: '/finance' },
     { path: '/finance', component: StyFinance },
     {
        path: '/info',
        name: 'introPage',
        component: introPage
      },
      {
        path: '/funds',
        name: 'FundsPage',
        component: FundsPage
      }]
})
export default router
